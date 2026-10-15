/*
 * SOVEREIGN AUTONOMOUS OUTBOUND SMTP ENGINE (ZERO API DEPENDENCY)
 * Architectural Spec: Direct Socket Transport, Internal DNS MX, DKIM RFC 6376, STARTTLS RFC 3207
 * System Target: POSIX Linux Engine Core
 * Dependencies: OpenSSL / LibCrypto (-lssl -lcrypto)
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <time.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>

#include <openssl/rsa.h>
#include <openssl/pem.h>
#include <openssl/sha.h>
#include <openssl/ssl.h>
#include <openssl/err.h>

#define BUFFER_SIZE 8192
#define DEFAULT_TIMEOUT_SEC 10
#define DNS_SERVER_IP "1.1.1.1"
#define DNS_PORT 53

/* -------------------------------------------------------------------------- */
/* DATA STRUCTURES                                                            */
/* -------------------------------------------------------------------------- */

typedef struct {
    char from_address[256];
    char to_address[256];
    char subject[256];
    char body[4096];
    char sender_domain[128];
    char dkim_selector[64];
    char pem_private_key[4096];
} outbound_email_t;

typedef struct {
    int socket_fd;
    SSL_CTX *ssl_ctx;
    SSL *ssl_handle;
    int is_tls;
} smtp_connection_t;

/* -------------------------------------------------------------------------- */
/* UTILITY & SOCKET HELPER FUNCTIONS                                         */
/* -------------------------------------------------------------------------- */

static int set_nonblocking(int fd) {
    int flags = fcntl(fd, F_GETFL, 0);
    if (flags == -1) return -1;
    return fcntl(fd, F_SETFL, flags | O_NONBLOCK);
}

static int socket_write_bytes(smtp_connection_t *conn, const char *data, size_t len) {
    if (conn->is_tls) {
        return SSL_write(conn->ssl_handle, data, (int)len);
    }
    return (int)send(conn->socket_fd, data, len, 0);
}

static int socket_read_bytes(smtp_connection_t *conn, char *buffer, size_t max_len) {
    memset(buffer, 0, max_len);
    if (conn->is_tls) {
        return SSL_read(conn->ssl_handle, buffer, (int)(max_len - 1));
    }
    return (int)recv(conn->socket_fd, buffer, max_len - 1, 0);
}

static int read_smtp_response(smtp_connection_t *conn, char *out_buf, size_t buf_size, int expected_code) {
    fd_set readfds;
    struct timeval tv = { .tv_sec = DEFAULT_TIMEOUT_SEC, .tv_usec = 0 };
    FD_ZERO(&readfds);
    FD_SET(conn->socket_fd, &readfds);

    int sel = select(conn->socket_fd + 1, &readfds, NULL, NULL, &tv);
    if (sel <= 0) return -1; // Timeout or error

    int bytes = socket_read_bytes(conn, out_buf, buf_size);
    if (bytes <= 0) return -2;

    int code = atoi(out_buf);
    if (code != expected_code && (code < expected_code || code >= expected_code + 100)) {
        return code; // Return actual non-matching response code
    }
    return 0; // Success
}

/* -------------------------------------------------------------------------- */
/* MODULE 1: DIRECT UDP DNS MX RESOLVER                                      */
/* -------------------------------------------------------------------------- */

static void build_dns_query_header(unsigned char *buf, uint16_t id) {
    memset(buf, 0, 12);
    buf[0] = (id >> 8) & 0xFF; buf[1] = id & 0xFF; // Query ID
    buf[2] = 0x01; buf[3] = 0x00;                  // Standard query, recursion desired
    buf[5] = 0x01;                                 // QDCOUNT = 1
}

static int encode_dns_domain_name(const char *domain, unsigned char *buf) {
    int pos = 0;
    const char *start = domain;
    const char *p = domain;

    while (*p) {
        if (*p == '.') {
            int len = p - start;
            buf[pos++] = (unsigned char)len;
            memcpy(&buf[pos], start, len);
            pos += len;
            start = p + 1;
        }
        p++;
    }
    int len = p - start;
    if (len > 0) {
        buf[pos++] = (unsigned char)len;
        memcpy(&buf[pos], start, len);
        pos += len;
    }
    buf[pos++] = 0x00; // Null label
    return pos;
}

static int parse_dns_mx_response(unsigned char *buf, int len, char *out_mx_host) {
    if (len < 12) return -1;
    int qdcount = (buf[4] << 8) | buf[5];
    int ancount = (buf[6] << 8) | buf[7];
    if (ancount == 0) return -2;

    int pos = 12;
    // Skip Question Section
    for (int i = 0; i < qdcount; i++) {
        while (pos < len && buf[pos] != 0) {
            if ((buf[pos] & 0xC0) == 0xC0) { pos += 2; break; }
            pos += buf[pos] + 1;
        }
        if (buf[pos] == 0) pos++;
        pos += 4; // Skip QTYPE and QCLASS
    }

    // Parse Answer Section for MX Record
    for (int i = 0; i < ancount; i++) {
        if (pos >= len) break;
        // Skip NAME pointer or labels
        if ((buf[pos] & 0xC0) == 0xC0) pos += 2;
        else {
            while (pos < len && buf[pos] != 0) pos += buf[pos] + 1;
            pos++;
        }

        uint16_t type = (buf[pos] << 8) | buf[pos + 1];
        uint16_t rdlength = (buf[pos + 8] << 8) | buf[pos + 9];
        pos += 10;

        if (type == 15) { // TYPE MX
            pos += 2; // Skip Preference integer
            // Parse Exchange Host Domain Name
            int out_pos = 0;
            int curr = pos;
            int jumped = 0;

            while (curr < len && buf[curr] != 0) {
                if ((buf[curr] & 0xC0) == 0xC0) {
                    curr = ((buf[curr] & 0x3F) << 8) | buf[curr + 1];
                    jumped = 1;
                } else {
                    int label_len = buf[curr++];
                    if (out_pos > 0) out_mx_host[out_pos++] = '.';
                    memcpy(&out_mx_host[out_pos], &buf[curr], label_len);
                    out_pos += label_len;
                    curr += label_len;
                }
            }
            out_mx_host[out_pos] = '\0';
            return 0; // MX Resolution successful
        } else {
            pos += rdlength;
        }
    }
    return -3;
}

static int resolve_mx_server(const char *domain, char *out_mx_ip) {
    int dns_fd = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (dns_fd < 0) return -1;

    struct sockaddr_in dns_addr = {
        .sin_family = AF_INET,
        .sin_port = htons(DNS_PORT),
        .sin_addr.s_addr = inet_addr(DNS_SERVER_IP)
    };

    unsigned char packet[512];
    build_dns_query_header(packet, 0x1234);
    int query_len = 12 + encode_dns_domain_name(domain, &packet[12]);
    packet[query_len++] = 0x00; packet[query_len++] = 0x0F; // Type MX
    packet[query_len++] = 0x00; packet[query_len++] = 0x01; // Class IN

    sendto(dns_fd, packet, query_len, 0, (struct sockaddr*)&dns_addr, sizeof(dns_addr));

    struct timeval tv = { .tv_sec = 3, .tv_usec = 0 };
    setsockopt(dns_fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

    unsigned char response[512];
    socklen_t addr_len = sizeof(dns_addr);
    int resp_len = recvfrom(dns_fd, response, sizeof(response), 0, (struct sockaddr*)&dns_addr, &addr_len);
    close(dns_fd);

    if (resp_len <= 0) return -2;

    char mx_hostname[256] = {0};
    if (parse_dns_mx_response(response, resp_len, mx_hostname) != 0) return -3;

    // Resolve MX Hostname to IPv4 Address
    struct hostent *he = gethostbyname(mx_hostname);
    if (!he) return -4;

    struct in_addr **addr_list = (struct in_addr **)he->h_addr_list;
    if (addr_list[0] != NULL) {
        strcpy(out_mx_ip, inet_ntoa(*addr_list[0]));
        return 0;
    }
    return -5;
}

/* -------------------------------------------------------------------------- */
/* MODULE 2: IN-MEMORY DKIM SIGNING ENGINE (RFC 6376 RELAXED/RELAXED)       */
/* -------------------------------------------------------------------------- */

static void base64_encode(const unsigned char *input, int length, char *output) {
    static const char b64[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    int i, j = 0;
    for (i = 0; i < length; i += 3) {
        uint32_t val = (input[i] << 16) | ((i + 1 < length ? input[i + 1] : 0) << 8) | (i + 2 < length ? input[i + 2] : 0);
        output[j++] = b64[(val >> 18) & 0x3F];
        output[j++] = b64[(val >> 12) & 0x3F];
        output[j++] = (i + 1 < length) ? b64[(val >> 6) & 0x3F] : '=';
        output[j++] = (i + 2 < length) ? b64[val & 0x3F] : '=';
    }
    output[j] = '\0';
}

static void compute_dkim_signature(const outbound_email_t *email, const char *body_hash_b64, char *out_sig_b64) {
    char headers_canonical[2048];
    snprintf(headers_canonical, sizeof(headers_canonical),
        "from:%s\r\n"
        "to:%s\r\n"
        "subject:%s\r\n"
        "dkim-signature:v=1; a=rsa-sha256; c=relaxed/relaxed; d=%s; s=%s; h=from:to:subject; bh=%s; b=",
        email->from_address, email->to_address, email->subject, email->sender_domain, email->dkim_selector, body_hash_b64);

    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256((const unsigned char*)headers_canonical, strlen(headers_canonical), hash);

    BIO *bio = BIO_new_mem_buf(email->pem_private_key, -1);
    RSA *rsa = PEM_read_bio_RSAPrivateKey(bio, NULL, NULL, NULL);
    BIO_free(bio);

    if (!rsa) return;

    unsigned char signature[512];
    unsigned int sig_len = 0;
    RSA_sign(NID_sha256, hash, SHA256_DIGEST_LENGTH, signature, &sig_len, rsa);
    RSA_free(rsa);

    base64_encode(signature, sig_len, out_sig_b64);
}

/* -------------------------------------------------------------------------- */
/* MODULE 3: PROTOCOL STATE MACHINE & DELIVERY EXECUTION                     */
/* -------------------------------------------------------------------------- */

int sovereign_smtp_send(const outbound_email_t *email) {
    char recipient_domain[128];
    const char *at_ptr = strchr(email->to_address, '@');
    if (!at_ptr) return -1;
    strcpy(recipient_domain, at_ptr + 1);

    // 1. Resolve MX IP
    char mx_ip[46] = {0};
    if (resolve_mx_server(recipient_domain, mx_ip) != 0) return -2;

    // 2. Initialize Non-Blocking Socket
    int sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (sock_fd < 0) return -3;
    set_nonblocking(sock_fd);

    struct sockaddr_in server_addr = {
        .sin_family = AF_INET,
        .sin_port = htons(25),
        .sin_addr.s_addr = inet_addr(mx_ip)
    };

    connect(sock_fd, (struct sockaddr*)&server_addr, sizeof(server_addr));

    smtp_connection_t conn = { .socket_fd = sock_fd, .ssl_ctx = NULL, .ssl_handle = NULL, .is_tls = 0 };
    char response_buf[BUFFER_SIZE];

    // 3. Read 220 Banner
    if (read_smtp_response(&conn, response_buf, sizeof(response_buf), 220) != 0) {
        close(sock_fd); return -4;
    }

    // 4. Send EHLO
    char command[512];
    snprintf(command, sizeof(command), "EHLO %s\r\n", email->sender_domain);
    socket_write_bytes(&conn, command, strlen(command));
    if (read_smtp_response(&conn, response_buf, sizeof(response_buf), 250) != 0) {
        close(sock_fd); return -5;
    }

    // 5. Upgrade Socket via STARTTLS
    snprintf(command, sizeof(command), "STARTTLS\r\n");
    socket_write_bytes(&conn, command, strlen(command));
    if (read_smtp_response(&conn, response_buf, sizeof(response_buf), 220) != 0) {
        close(sock_fd); return -6;
    }

    SSL_library_init();
    OpenSSL_add_all_algorithms();
    SSL_load_error_strings();
    conn.ssl_ctx = SSL_CTX_new(TLS_client_method());
    conn.ssl_handle = SSL_new(conn.ssl_ctx);
    SSL_set_fd(conn.ssl_handle, sock_fd);

    if (SSL_connect(conn.ssl_handle) <= 0) {
        SSL_free(conn.ssl_handle); SSL_CTX_free(conn.ssl_ctx); close(sock_fd);
        return -7;
    }
    conn.is_tls = 1;

    // 6. Re-EHLO over encrypted TLS channel
    snprintf(command, sizeof(command), "EHLO %s\r\n", email->sender_domain);
    socket_write_bytes(&conn, command, strlen(command));
    read_smtp_response(&conn, response_buf, sizeof(response_buf), 250);

    // 7. MAIL FROM
    snprintf(command, sizeof(command), "MAIL FROM:<%s>\r\n", email->from_address);
    socket_write_bytes(&conn, command, strlen(command));
    if (read_smtp_response(&conn, response_buf, sizeof(response_buf), 250) != 0) goto failure;

    // 8. RCPT TO
    snprintf(command, sizeof(command), "RCPT TO:<%s>\r\n", email->to_address);
    socket_write_bytes(&conn, command, strlen(command));
    if (read_smtp_response(&conn, response_buf, sizeof(response_buf), 250) != 0) goto failure;

    // 9. DATA Initiator
    snprintf(command, sizeof(command), "DATA\r\n");
    socket_write_bytes(&conn, command, strlen(command));
    if (read_smtp_response(&conn, response_buf, sizeof(response_buf), 354) != 0) goto failure;

    // 10. Construct MIME Payload & Sign DKIM
    unsigned char body_hash[SHA256_DIGEST_LENGTH];
    SHA256((const unsigned char*)email->body, strlen(email->body), body_hash);
    char body_hash_b64[128];
    base64_encode(body_hash, SHA256_DIGEST_LENGTH, body_hash_b64);

    char dkim_sig_b64[512] = {0};
    compute_dkim_signature(email, body_hash_b64, dkim_sig_b64);

    char full_payload[BUFFER_SIZE * 2];
    snprintf(full_payload, sizeof(full_payload),
        "DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=%s; s=%s;\r\n"
        "  h=from:to:subject; bh=%s;\r\n"
        "  b=%s\r\n"
        "From: %s\r\n"
        "To: %s\r\n"
        "Subject: %s\r\n"
        "MIME-Version: 1.0\r\n"
        "Content-Type: text/plain; charset=UTF-8\r\n\r\n"
        "%s\r\n.\r\n",
        email->sender_domain, email->dkim_selector, body_hash_b64, dkim_sig_b64,
        email->from_address, email->to_address, email->subject, email->body);

    // 11. Stream Payload & Finalize Transaction
    socket_write_bytes(&conn, full_payload, strlen(full_payload));
    if (read_smtp_response(&conn, response_buf, sizeof(response_buf), 250) != 0) goto failure;

    // 12. QUIT Command
    snprintf(command, sizeof(command), "QUIT\r\n");
    socket_write_bytes(&conn, command, strlen(command));

    SSL_shutdown(conn.ssl_handle);
    SSL_free(conn.ssl_handle);
    SSL_CTX_free(conn.ssl_ctx);
    close(sock_fd);
    return 0; // SUCCESSFUL AUTONOMOUS TRANSMISSION

failure:
    SSL_shutdown(conn.ssl_handle);
    SSL_free(conn.ssl_handle);
    SSL_CTX_free(conn.ssl_ctx);
    close(sock_fd);
    return -8;
}
