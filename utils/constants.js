module.exports = {
  BATCH_PREFIX: {
    PRIMARY: 'CJ',
    MATERIAL: 'YL',
    PRODUCT: 'CP'
  },

  HERB_TYPES: [
    { value: 'fangfeng', label: '防风' },
    { value: 'chaihu', label: '柴胡' },
    { value: 'huangqi', label: '黄芪' },
    { value: 'other', label: '其他' }
  ],

  FARM_OPERATION_TYPES: [
    { value: 'sow', label: '播种', icon: '🌱' },
    { value: 'fertilize', label: '施肥', icon: '🧪' },
    { value: 'pesticide', label: '施药', icon: '💊' },
    { value: 'weed', label: '除草', icon: '🌿' },
    { value: 'irrigate', label: '灌溉', icon: '💧' },
    { value: 'prune', label: '修剪', icon: '✂️' },
    { value: 'harvest', label: '采收', icon: '🌾' },
    { value: 'other', label: '其他', icon: '📝' }
  ],

  GROWTH_STAGES: [
    { value: 'sow', label: '播种期' },
    { value: 'sprout', label: '发芽期' },
    { value: 'grow', label: '生长期' },
    { value: 'harvest', label: '采收期' }
  ],

  PROCESS_STATIONS: [
    { value: 'wash', label: '清洗工位', icon: '💧' },
    { value: 'slice', label: '切片工位', icon: '🔪' },
    { value: 'dry', label: '烘干工位', icon: '🔥' },
    { value: 'pack', label: '分装工位', icon: '📦' }
  ],

  BATCH_STATUS: [
    { value: 'pending', label: '待处理', tagClass: 'tag-orange' },
    { value: 'processing', label: '加工中', tagClass: 'tag-blue' },
    { value: 'completed', label: '已完成', tagClass: 'tag-green' },
    { value: 'rejected', label: '已驳回', tagClass: 'tag-red' }
  ],

  INSPECT_TYPES: [
    { value: 'physical', label: '理化指标' },
    { value: 'content', label: '含量测定' },
    { value: 'microbial', label: '微生物限度' },
    { value: 'pesticide_residue', label: '农药残留' },
    { value: 'heavy_metal', label: '重金属' }
  ],

  INSPECT_STATUS: [
    { value: 'pending', label: '待检验', tagClass: 'tag-orange' },
    { value: 'testing', label: '检验中', tagClass: 'tag-blue' },
    { value: 'passed', label: '合格', tagClass: 'tag-green' },
    { value: 'failed', label: '不合格', tagClass: 'tag-red' }
  ],

  REPORT_TEMPLATES: [
    { value: 'gap_batch', label: '中药材生产批记录（GAP）' },
    { value: 'gmp_batch', label: '中药饮片生产批记录（GMP）' },
    { value: 'coa', label: '成品检验报告单（COA）' },
    { value: 'material_balance', label: '物料平衡计算表' }
  ],

  IOT_ALARM_THRESHOLD: {
    temperature: { min: -2, max: 2, unit: '°C' },
    humidity: { min: -5, max: 5, unit: '%RH' }
  },

  IOT_DATA_INTERVAL: 5 * 60 * 1000,

  FORBIDDEN_PESTICIDES: [
    '甲胺磷', '甲基对硫磷', '对硫磷', '久效磷', '磷胺',
    '六六六', '滴滴涕', '毒杀芬', '二溴氯丙烷', '杀虫脒',
    '二溴乙烷', '除草醚', '艾氏剂', '狄氏剂', '汞制剂',
    '砷类', '铅类', '敌枯双', '氟乙酰胺', '甘氟',
    '毒鼠强', '氟乙酸钠', '毒鼠硅'
  ],

  SOIL_TYPES: [
    { value: 'loam', label: '壤土' },
    { value: 'clay', label: '黏土' },
    { value: 'sand', label: '砂土' },
    { value: 'sandy_loam', label: '砂壤土' }
  ],

  FERTILIZER_TYPES: [
    { value: 'organic', label: '有机肥' },
    { value: 'compound', label: '复合肥' },
    { value: 'nitrogen', label: '氮肥' },
    { value: 'phosphorus', label: '磷肥' },
    { value: 'potassium', label: '钾肥' },
    { value: 'other', label: '其他' }
  ],

  PESTICIDE_TYPES: [
    { value: 'insecticide', label: '杀虫剂' },
    { value: 'fungicide', label: '杀菌剂' },
    { value: 'herbicide', label: '除草剂' },
    { value: 'plant_growth', label: '植物生长调节剂' },
    { value: 'other', label: '其他' }
  ],

  ROLES: [
    { value: 'farmer', label: '农户' },
    { value: 'worker', label: '加工工人' },
    { value: 'inspector', label: '检验员' },
    { value: 'manager', label: '管理员' },
    { value: 'admin', label: '系统管理员' }
  ]
}
