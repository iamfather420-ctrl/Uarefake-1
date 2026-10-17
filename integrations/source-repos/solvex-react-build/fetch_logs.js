fetch('https://api.github.com/repos/iamfather420-ctrl/solvex-react-build/actions/runs/26370984667/jobs')
  .then(res => res.text())
  .then(text => console.log(JSON.stringify(JSON.parse(text).jobs.map(j => ({id: j.id, name: j.name, status: j.status, conclusion: j.conclusion, steps: j.steps.filter(s => s.conclusion === 'failure')})), null, 2)));
