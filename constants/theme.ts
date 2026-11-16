export const palette = {
  light: { background: '#F6F5EF', surface: '#FFFEFA', inset: '#ECEEE6', text: '#233D35', subtle: '#65756D', border: '#DEE4D9', primary: '#276C52', primarySoft: '#E1EEE4', onPrimary: '#FFFFFF', weekend: '#B74D32', weekendSoft: '#FAE9DE', paid: '#3D718F', paidSoft: '#E4EFF4', danger: '#AC3F35', overlay: 'rgba(20,36,29,0.45)' },
  dark: { background: '#14241F', surface: '#1D3028', inset: '#263C32', text: '#F1F3E9', subtle: '#B0C1B5', border: '#385046', primary: '#A4D5B1', primarySoft: '#304B3A', onPrimary: '#14241F', weekend: '#F2AA88', weekendSoft: '#4A3329', paid: '#A5CFEB', paidSoft: '#283F4C', danger: '#FFAD9E', overlay: 'rgba(0,0,0,0.65)' },
};
export type ThemeColors = typeof palette.light;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 12, md: 20, lg: 28, pill: 100 };
export const typeScale = { caption: 12, small: 14, body: 16, section: 20, title: 28, hero: 36 };
