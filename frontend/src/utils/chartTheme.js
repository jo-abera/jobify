/** Chart.js canvas tooltips do not parse CSS variables — use explicit theme colors. */

export function getChartTooltipTheme(theme) {
  if (theme === 'light') {
    return {
      backgroundColor: '#ffffff',
      titleColor: '#16161d',
      bodyColor: '#5b5f6e',
      borderColor: '#e0ecef',
    };
  }
  return {
    backgroundColor: '#1c1f28',
    titleColor: '#f5fafb',
    bodyColor: '#a8adb8',
    borderColor: '#2a3038',
  };
}

export function getChartTickColor(theme) {
  return theme === 'light' ? '#8b8f9a' : '#a8adb8';
}

export function getChartGridColor(theme) {
  return theme === 'light' ? '#e0ecef' : '#2a3038';
}