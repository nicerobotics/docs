import type { ConfigurationLine, ConfigurationSet } from '../../../components/mdx/configuration';
import type { Locale } from '../../../i18n/locales';

const labels = {
  'zh-CN': {
    diameter: '滚轴塞外径', count: '同步带轮数量', plug: '滚轴塞', pulley: '同步带轮', shaft: '滚轴转轴',
    stacks: ['无带轮', '单带轮', '双带轮'], shafts: ['短轴', '基础轴', '长轴'],
    fit: (od: number, wall: number) => `适配外径 ${od} mm、壁厚 ${wall} mm 的圆管`,
    bearing: '轴承', screws: '带轮固定螺丝', shaftScrew: '转轴螺丝', nut: '防松螺母', ring: '轴用挡圈',
    guides: ['单滚轴塞', '滚轴塞滚轴同步带轮', '滚轴塞双滚轴同步带轮'],
  },
  'zh-Hant': {
    diameter: '端塞外徑', count: '時規皮帶輪數量', plug: '滾筒端塞', pulley: '時規皮帶輪', shaft: '滾筒軸',
    stacks: ['無皮帶輪', '單皮帶輪', '雙皮帶輪'], shafts: ['短軸', '標準軸', '長軸'],
    fit: (od: number, wall: number) => `適用外徑 ${od} mm、壁厚 ${wall} mm 的圓管`,
    bearing: '軸承', screws: '皮帶輪固定螺絲', shaftScrew: '滾筒軸螺絲', nut: '防鬆螺帽', ring: '軸用扣環',
    guides: ['僅端塞', '端塞單時規皮帶輪', '端塞雙時規皮帶輪'],
  },
  en: {
    diameter: 'End plug OD', count: 'Timing pulley count', plug: 'End plug', pulley: 'Timing pulley', shaft: 'Roller shaft',
    stacks: ['No pulley', 'One pulley', 'Two pulleys'], shafts: ['Short', 'Standard', 'Long'],
    fit: (od: number, wall: number) => `Fits ${od} mm OD × ${wall} mm wall tubing`,
    bearing: 'Bearing', screws: 'Pulley mounting screws', shaftScrew: 'Shaft screw', nut: 'Locknut', ring: 'External retaining ring',
    guides: ['end-plug-only', 'end-plug--one-timing-pulley', 'end-plug--two-timing-pulleys'],
  },
};

const plugs = [{ diameter: 31, tubeOD: 35, sku: 'NICE-07-05-001' }, { diameter: 46, tubeOD: 50, sku: 'NICE-07-05-002' }];
const shafts = [
  { sku: 'NICE-07-05-004', length: 38.5, screw: 'M5*45', pulleyScrew: '' },
  { sku: 'NICE-07-05-005', length: 52, screw: 'M5*60', pulleyScrew: 'M3*22' },
  { sku: 'NICE-07-05-006', length: 65.5, screw: 'M5*80', pulleyScrew: 'M3*35' },
];
const image = (name: string) => `/assets/docs/wheels/roller-system/${name}.webp`;
const hardware = (slot: string, name: string, detail: string, quantity: number): ConfigurationLine =>
  ({ slot, name, part: detail, detail, quantity });

export function rollerConfigurations(locale: Locale): ConfigurationSet {
  const t = labels[locale];
  const configurations = plugs.flatMap(({ diameter, tubeOD, sku }) => shafts.map((shaft, count) => ({
    choices: [String(diameter), String(count)],
    title: `Ø${diameter} mm · ${t.stacks[count]}`,
    fit: t.fit(tubeOD, (tubeOD - diameter) / 2),
    image: image(`assembly-${diameter}-${count}`),
    guide: '#' + t.guides[count],
    parts: [
      { slot: 'plug', name: t.plug, part: sku, detail: `Ø${diameter} mm`, quantity: 1, image: image(`plug-${diameter}`) },
      { slot: 'pulley', name: t.pulley, part: 'NICE-07-05-003', detail: '22T · HTD 5M', quantity: count, image: image('pulley') },
      { slot: 'shaft', name: t.shaft, part: shaft.sku, detail: `${t.shafts[count]} · ${shaft.length} mm`, quantity: 1, image: image(`shaft-${count}`) },
    ],
    hardware: [
      hardware('mounting-screws', t.screws, shaft.pulleyScrew, count ? 4 : 0),
      hardware('shaft-screw', t.shaftScrew, shaft.screw, 1),
      hardware('bearing', t.bearing, '6701ZZ', 2),
      hardware('nut', t.nut, 'M5', 1),
      hardware('ring', t.ring, 'Ø12 mm', 1),
    ],
  })));
  return {
    groups: [
      { label: t.diameter, options: plugs.map(p => ({ value: String(p.diameter), label: `Ø${p.diameter} mm` })) },
      { label: t.count, options: shafts.map((_, count) => ({ value: String(count), label: String(count) })) },
    ],
    configurations,
    initial: configurations[1],
  };
}
