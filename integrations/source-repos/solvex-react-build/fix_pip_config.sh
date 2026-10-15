#!/bin/bash
# SolveX-Integrated-Pipeline: fix_pip_config.sh
# Purpose: Configure pip to bypass PEP 668 in the Ubuntu proot environment

echo "=========================================================="
echo " Configuring pip globally in Ubuntu Proot                 "
echo "=========================================================="

cat << 'EOF' > fix_pip_env.sh
mkdir -p ~/.config/pip
cat << 'INNER_EOF' > ~/.config/pip/pip.conf
[global]
break-system-packages = true
INNER_EOF
echo "Pip configuration updated. 'break-system-packages' enabled globally."
EOF

chmod +x fix_pip_env.sh
proot-distro login ubuntu -- bash -c "./fix_pip_env.sh"
rm fix_pip_env.sh

echo "=========================================================="
echo " [✓] Pip configured. You can now try building again."
echo "     Run: ./run_proot_build.sh"
echo "=========================================================="
