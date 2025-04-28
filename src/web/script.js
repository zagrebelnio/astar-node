async function loadResults() {
  const response = await fetch('/results');
  const data = await response.json();
  const container = document.getElementById('results');

  const grouped = {};

  data.forEach(({ grid, sequential, parallel }) => {
    if (!sequential.found) return;

    if (!grouped[grid]) {
      grouped[grid] = {
        sequentialTimes: [],
        parallelMap: {},
      };
    }

    grouped[grid].sequentialTimes.push(sequential.time);

    parallel.forEach((p) => {
      if (p.found) {
        if (!grouped[grid].parallelMap[p.threads]) {
          grouped[grid].parallelMap[p.threads] = [];
        }
        grouped[grid].parallelMap[p.threads].push(p.time);
      }
    });
  });

  Object.entries(grouped).forEach(
    ([grid, { sequentialTimes, parallelMap }]) => {
      const avgSeq = average(sequentialTimes);
      const labels = Object.keys(parallelMap)
        .map(Number)
        .sort((a, b) => a - b);
      const avgPar = labels.map((threads) => average(parallelMap[threads]));

      const avgSpeedUps = labels.map(
        (threads) => avgSeq / average(parallelMap[threads])
      );

      const chartId = `chart-${grid.replace('x', '_')}`;
      const wrapper = document.createElement('div');

      const heading = document.createElement('h2');
      heading.textContent = `Grid ${grid}`;
      wrapper.appendChild(heading);

      const canvas = document.createElement('canvas');
      canvas.id = chartId;
      canvas.width = 800;
      canvas.height = 400;
      wrapper.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Parallel (avg)',
              data: avgPar,
              borderColor: 'blue',
              fill: false,
            },
            {
              label: 'Sequential (avg)',
              data: Array(labels.length).fill(avgSeq),
              borderColor: 'gray',
              borderDash: [5, 5],
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              title: { display: true, text: 'Avg Time (ms)' },
              beginAtZero: true,
            },
            x: {
              title: { display: true, text: 'Threads' },
            },
          },
        },
      });

      const table = document.createElement('table');
      table.innerHTML = `
      <thead>
        <tr>
          <th>Mode</th>
          <th>Threads</th>
          <th>Avg Time (ms)</th>
          <th>Avg Speed-up</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Sequential</td>
          <td>-</td>
          <td>${avgSeq.toFixed(2)}</td>
          <td>-</td>
        </tr>
        ${labels
          .map(
            (threads, i) => `
          <tr>
            <td>Parallel</td>
            <td>${threads}</td>
            <td>${avgPar[i].toFixed(2)}</td>
            <td>${avgSpeedUps[i].toFixed(2)}x</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    `;
      wrapper.appendChild(table);

      container.appendChild(wrapper);
    }
  );
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

loadResults();
