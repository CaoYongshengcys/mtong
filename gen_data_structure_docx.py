from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

style = doc.styles['Normal']
style.font.name = '宋体'
style.font.size = Pt(10.5)
style.element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
style.paragraph_format.line_spacing = 1.25

for level in range(1, 5):
    hs = doc.styles[f'Heading {level}']
    hs.font.name = '黑体'
    hs.element.rPr.rFonts.set(qn('w:eastAsia'), '黑体')
    hs.font.color.rgb = RGBColor(0, 0, 0)
    if level == 1:
        hs.font.size = Pt(18)
    elif level == 2:
        hs.font.size = Pt(15)
    elif level == 3:
        hs.font.size = Pt(13)
    elif level == 4:
        hs.font.size = Pt(11)

section = doc.sections[0]
section.page_width = Cm(21)
section.page_height = Cm(29.7)
section.left_margin = Cm(2.54)
section.right_margin = Cm(2.54)
section.top_margin = Cm(2.54)
section.bottom_margin = Cm(2.54)


def set_cell_shading(cell, color):
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        for p in hdr_cells[i].paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.bold = True
                run.font.size = Pt(10)
                run.font.name = '黑体'
                run.element.rPr.rFonts.set(qn('w:eastAsia'), '黑体')
        set_cell_shading(hdr_cells[i], 'D9E2F3')
    for ri, row_data in enumerate(rows):
        row_cells = table.rows[ri + 1].cells
        for ci, val in enumerate(row_data):
            row_cells[ci].text = val
            for p in row_cells[ci].paragraphs:
                for run in p.runs:
                    run.font.size = Pt(9)
                    run.font.name = '宋体'
                    run.element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
    return table


def add_bold_normal(doc, bold_text, normal_text):
    p = doc.add_paragraph()
    run_b = p.add_run(bold_text)
    run_b.bold = True
    run_b.font.name = '宋体'
    run_b.element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
    run_n = p.add_run(normal_text)
    run_n.font.name = '宋体'
    run_n.element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
    return p


# ==================== Title ====================
doc.add_heading('河北好药数字化体系数据结构图（优化版·码码通专项）', level=1)

# ==================== Section 1 ====================
doc.add_heading('一、核心设计理念：「码码通」驱动全流程', level=2)
add_bold_normal(doc, '核心逻辑：', '以「码码通」微信小程序为唯一移动端入口，以手机号为身份锚点，以二维码为数据载体，实现"一码当先，万码互通"。')
add_bold_normal(doc, '用户体验：', '农户/工人"扫一扫"即可干活，系统通过手机号自动带出待办任务和关联数据，"选一选"即可完成填报，零打字、零培训。')

doc.add_heading('二、详细数据结构清单（含二级字段）', level=2)
doc.add_heading('1. 基础资源与身份绑定（「码码通」基石）', level=3)

# 1.1 sys_user_mobile
doc.add_heading('1.1 系统用户与手机号绑定表（sys_user_mobile）', level=4)
doc.add_paragraph('核心作用：建立"手机号=身份"的强关联，是所有扫码操作的安全底座。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['user_id', 'VARCHAR(32)', '用户ID，主键'],
    ['mobile_no', 'VARCHAR(11)', '手机号码，唯一索引，登录凭证'],
    ['real_name', 'VARCHAR(20)', '真实姓名'],
    ['id_card_no', 'VARCHAR(18)', '身份证号，用于实名认证'],
    ['role_type', 'TINYINT', '角色：1-基地管理员 / 2-种植户 / 3-质检员 / 4-车间主任 / 5-系统管理员'],
    ['bound_land_ids', 'JSON', '关联地块ID数组，扫码时自动过滤非管辖地块'],
    ['wechat_openid', 'VARCHAR(64)', '微信OpenID，用于小程序静默登录'],
    ['status', 'TINYINT', '状态：1-启用 / 0-禁用'],
    ['create_time', 'DATETIME', '注册时间'],
    ['update_time', 'DATETIME', '最后更新时间'],
])

# 1.2 gap_land_parcel
doc.add_heading('1.2 地块主数据与实体二维码表（gap_land_parcel）', level=4)
doc.add_paragraph('核心作用：地块的物理身份证，扫码即可查看地块档案并进行农事操作。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['land_id', 'VARCHAR(32)', '地块ID，主键'],
    ['land_qrcode', 'VARCHAR(200)', '地块实体二维码，内容：https://m.cmht.com/lot/{land_id}'],
    ['land_no', 'VARCHAR(20)', '地块编号，如 KB-2026-A01'],
    ['land_name', 'VARCHAR(50)', '地块名称'],
    ['herb_type', 'VARCHAR(20)', '药材品种编码，关联品种编码表'],
    ['area_mu', 'DECIMAL(8,2)', '面积（亩）'],
    ['gps_polygon', 'JSON', 'GPS围栏坐标，JSON数组'],
    ['altitude', 'INT', '海拔（米）'],
    ['soil_type', 'VARCHAR(20)', '土壤类型编码'],
    ['responsible_mobile', 'VARCHAR(11)', '责任人手机号，关联 sys_user_mobile'],
    ['soil_report_url', 'VARCHAR(200)', '土壤检测报告OSS路径'],
    ['status', 'TINYINT', '状态：1-种植中 / 2-休耕 / 3-废弃'],
    ['create_time', 'DATETIME', '创建时间'],
    ['update_time', 'DATETIME', '最后更新时间'],
])

# 1.3 gap_input_batch
doc.add_heading('1.3 种苗/农资与批次二维码表（gap_input_batch）', level=4)
doc.add_paragraph('核心作用：投入品的物理身份证，扫码即可记录消耗。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['batch_id', 'VARCHAR(32)', '批次ID，主键'],
    ['entity_qrcode', 'VARCHAR(200)', '批次实体二维码，内容：https://m.cmht.com/batch/{batch_id}'],
    ['material_type', 'TINYINT', '类型：1-种子 / 2-肥料 / 3-农药'],
    ['material_name', 'VARCHAR(50)', '名称'],
    ['batch_no', 'VARCHAR(30)', '供应商批次号'],
    ['registration_no', 'VARCHAR(30)', '登记证号'],
    ['supplier_name', 'VARCHAR(50)', '供应商'],
    ['unit', 'VARCHAR(10)', '单位：kg / g / L / mL'],
    ['stock_quantity', 'DECIMAL(10,2)', '当前库存'],
    ['is_forbidden', 'TINYINT', '是否禁限用：1-是 / 0-否'],
    ['pre_harvest_interval', 'INT', '安全间隔期（天），农药必填'],
    ['status', 'TINYINT', '状态：1-在用 / 0-停用'],
    ['create_time', 'DATETIME', '入库时间'],
])

# ==================== Section 2 ====================
doc.add_heading('2. 种植档案（GAP过程数据·扫码录入）', level=3)

# 2.1 gap_sowing_record
doc.add_heading('2.1 播种记录表（gap_sowing_record）', level=4)
doc.add_paragraph('操作场景：工人扫地块码 → 系统自动带出地块信息 → 扫种苗码 → 选"播种" → 提交。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['record_id', 'VARCHAR(32)', '记录ID，主键'],
    ['land_id', 'VARCHAR(32)', '地块ID，扫地块码自动带出'],
    ['input_batch_id', 'VARCHAR(32)', '种苗批次ID，扫种苗码自动带出'],
    ['operator_mobile', 'VARCHAR(11)', '操作人手机号，系统自动获取'],
    ['sowing_date', 'DATE', '播种日期，默认当天'],
    ['sowing_method', 'TINYINT', '播种方式：1-机播 / 2-人工撒播 / 3-穴栽'],
    ['seed_quantity', 'DECIMAL(8,2)', '用种量（kg）'],
    ['photo_urls', 'JSON', '现场照片URL数组，带GPS水印'],
    ['gps_location', 'JSON', '操作时GPS坐标 {lat, lng}'],
    ['in_fence', 'TINYINT', '是否在围栏内：1-是 / 0-否'],
    ['remark', 'VARCHAR(200)', '备注'],
    ['submit_time', 'DATETIME', '提交时间，自动生成'],
])

# 2.2 gap_fertilization_record
doc.add_heading('2.2 施肥记录表（gap_fertilization_record）', level=4)
doc.add_paragraph('操作场景：工人扫地块码 → 系统带出地块 → 扫肥料码 → 选"施肥量" → 提交。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['record_id', 'VARCHAR(32)', '记录ID，主键'],
    ['land_id', 'VARCHAR(32)', '地块ID，扫地块码自动带出'],
    ['input_batch_id', 'VARCHAR(32)', '肥料批次ID，扫肥料码自动带出'],
    ['operator_mobile', 'VARCHAR(11)', '操作人手机号'],
    ['dosage', 'DECIMAL(8,2)', '施肥量（kg/亩）'],
    ['method', 'TINYINT', '施肥方式：1-沟施 / 2-穴施 / 3-撒施'],
    ['labor_cost', 'DECIMAL(8,2)', '人工成本（元）'],
    ['material_cost', 'DECIMAL(8,2)', '物料成本（元）'],
    ['photo_urls', 'JSON', '现场照片'],
    ['gps_location', 'JSON', 'GPS坐标'],
    ['in_fence', 'TINYINT', '是否在围栏内'],
    ['remark', 'VARCHAR(200)', '备注'],
    ['submit_time', 'DATETIME', '提交时间'],
])

# 2.3 gap_pesticide_record
doc.add_heading('2.3 打药记录表（gap_pesticide_record）', level=4)
doc.add_paragraph('操作场景：工人扫地块码 → 扫农药码 → 系统自动带出安全间隔期 → 选"稀释倍数" → 提交。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['record_id', 'VARCHAR(32)', '记录ID，主键'],
    ['land_id', 'VARCHAR(32)', '地块ID'],
    ['input_batch_id', 'VARCHAR(32)', '农药批次ID'],
    ['operator_mobile', 'VARCHAR(11)', '操作人手机号'],
    ['dilution_ratio', 'INT', '稀释倍数：500 / 1000 / 1500'],
    ['dosage', 'DECIMAL(8,2)', '用药量（mL/亩）'],
    ['pre_harvest_interval', 'INT', '安全间隔期（天），系统从农药库自动带出，不可修改'],
    ['ai_check_result', 'JSON', 'AI识别结果，含识别名称、置信度、是否禁限用'],
    ['photo_urls', 'JSON', '现场照片'],
    ['gps_location', 'JSON', 'GPS坐标'],
    ['in_fence', 'TINYINT', '是否在围栏内'],
    ['remark', 'VARCHAR(200)', '备注'],
    ['submit_time', 'DATETIME', '提交时间'],
])

# 2.4 gap_harvest_record
doc.add_heading('2.4 采收记录表（gap_harvest_record）', level=4)
doc.add_paragraph('操作场景：工人扫地块码 → 选"采收" → 输入重量 → 系统生成采收批次码。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['harvest_batch_no', 'VARCHAR(20)', '采收批次号，主键，规则：CJ+日期+流水'],
    ['land_id', 'VARCHAR(32)', '地块ID'],
    ['operator_mobile', 'VARCHAR(11)', '操作人手机号'],
    ['herb_type', 'VARCHAR(20)', '药材品种编码'],
    ['gross_weight', 'DECIMAL(10,2)', '毛重（kg）'],
    ['net_weight', 'DECIMAL(10,2)', '净重（kg）'],
    ['harvest_date', 'DATE', '采收日期'],
    ['harvest_qrcode', 'VARCHAR(200)', '采收批次二维码，内容：https://m.cmht.com/harvest/{harvest_batch_no}'],
    ['photo_urls', 'JSON', '现场照片'],
    ['gps_location', 'JSON', 'GPS坐标'],
    ['status', 'TINYINT', '状态：1-待入库 / 2-已入库 / 3-已拒收'],
    ['submit_time', 'DATETIME', '提交时间'],
])

# ==================== Section 3 ====================
doc.add_heading('3. 收购与工厂检测（流转衔接·码码互通）', level=3)

# 3.1 pur_receiving
doc.add_heading('3.1 收购入库表（pur_receiving）', level=4)
doc.add_paragraph('操作场景：质检员扫采收批次码 → 系统带出产地信息 → 录入质检结果 → 生成内部物料码。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['receive_id', 'VARCHAR(32)', '入库单ID，主键'],
    ['harvest_batch_no', 'VARCHAR(20)', '采收批次号，扫采收码自动带出'],
    ['internal_batch_no', 'VARCHAR(20)', '内部物料批号，规则：YL+日期+流水'],
    ['internal_qrcode', 'VARCHAR(200)', '内部物料二维码，内容：https://m.cmht.com/internal/{internal_batch_no}'],
    ['qa_mobile', 'VARCHAR(11)', '质检员手机号'],
    ['quality_result', 'TINYINT', '质检结果：1-合格 / 2-让步接收 / 3-拒收'],
    ['reject_reason', 'VARCHAR(200)', '拒收原因，若拒收则必填'],
    ['received_weight', 'DECIMAL(10,2)', '实收重量（kg）'],
    ['storage_location', 'VARCHAR(50)', '存放库位'],
    ['status', 'TINYINT', '状态：1-待检 / 2-已入库 / 3-已拒收'],
    ['create_time', 'DATETIME', '创建时间'],
])

# 3.2 lab_inspection
doc.add_heading('3.2 工厂检测表（lab_inspection）', level=4)
doc.add_paragraph('操作场景：化验员扫内部物料码 → 系统带出样品信息 → 选"检验项目" → 录入结果。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['task_id', 'VARCHAR(32)', '任务ID，主键'],
    ['internal_batch_no', 'VARCHAR(20)', '内部物料批号，扫物料码自动带出'],
    ['sample_no', 'VARCHAR(20)', '样品编号'],
    ['inspector_mobile', 'VARCHAR(11)', '化验员手机号'],
    ['test_items', 'JSON', '检验项目与结果，格式：[{"item":"水分","standard":"≤13.0%","result":"11.2%","qualified":true}]'],
    ['conclusion', 'TINYINT', '结论：1-合格 / 2-不合格'],
    ['report_url', 'VARCHAR(200)', 'COA报告PDF路径'],
    ['status', 'TINYINT', '状态：1-待检验 / 2-检验中 / 3-已完成'],
    ['create_time', 'DATETIME', '创建时间'],
    ['complete_time', 'DATETIME', '完成时间'],
])

# ==================== Section 4 ====================
doc.add_heading('4. 加工生产（GMP过程数据·扫码流转）', level=3)

# 4.1 prod_order
doc.add_heading('4.1 生产指令表（prod_order）', level=4)
doc.add_paragraph('操作场景：车间主任扫内部物料码 → 下达生产指令 → 生成成品批号。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['order_id', 'VARCHAR(32)', '生产指令ID，主键'],
    ['internal_batch_no', 'VARCHAR(20)', '内部物料批号'],
    ['prod_batch_no', 'VARCHAR(20)', '成品批号，规则：CP+日期+流水'],
    ['prod_qrcode', 'VARCHAR(200)', '生产工单二维码，内容：https://m.cmht.com/prod/{prod_batch_no}'],
    ['product_name', 'VARCHAR(50)', '成品名称'],
    ['plan_quantity', 'DECIMAL(10,2)', '计划生产量（kg）'],
    ['actual_quantity', 'DECIMAL(10,2)', '实际生产量（kg）'],
    ['status', 'TINYINT', '状态：1-待生产 / 2-生产中 / 3-已完成'],
    ['creator_mobile', 'VARCHAR(11)', '创建人手机号'],
    ['create_time', 'DATETIME', '创建时间'],
    ['complete_time', 'DATETIME', '完成时间'],
])

# 4.2 prod_station_record
doc.add_heading('4.2 工位扫码记录表（prod_station_record）', level=4)
doc.add_paragraph('操作场景：工人扫工单码 → 扫工位码 → 系统自动记录 → 关联IoT数据。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['record_id', 'VARCHAR(32)', '记录ID，主键'],
    ['order_id', 'VARCHAR(32)', '生产指令ID'],
    ['station_code', 'VARCHAR(20)', '工位码，如 WASH001 / SLICE001 / DRY001 / PACK001'],
    ['station_name', 'VARCHAR(20)', '工位名称：清洗 / 切片 / 烘干 / 分装'],
    ['operator_mobile', 'VARCHAR(11)', '操作人手机号'],
    ['start_time', 'DATETIME', '开始时间'],
    ['end_time', 'DATETIME', '结束时间'],
    ['iot_device_id', 'VARCHAR(32)', '关联IoT设备ID，烘干工位自动取温湿度数据'],
    ['station_params', 'JSON', '工位参数，如切片厚度、水质检测结果等'],
    ['status', 'TINYINT', '状态：1-进行中 / 2-已完成'],
    ['create_time', 'DATETIME', '创建时间'],
])

# ==================== Section 5 ====================
doc.add_heading('5. IoT设备管理', level=3)

# 5.1 iot_device
doc.add_heading('5.1 IoT设备表（iot_device）', level=4)
add_table(doc, ['字段名', '类型', '说明'], [
    ['device_id', 'VARCHAR(32)', '设备ID，主键'],
    ['device_name', 'VARCHAR(50)', '设备名称'],
    ['device_type', 'TINYINT', '类型：1-温湿度传感器'],
    ['location', 'VARCHAR(50)', '安装位置'],
    ['protocol', 'VARCHAR(20)', '通信协议：Modbus RTU over TCP'],
    ['collect_interval', 'INT', '采集频率（秒），默认300'],
    ['temp_threshold', 'JSON', '温度告警阈值 {min, max}'],
    ['humidity_threshold', 'JSON', '湿度告警阈值 {min, max}'],
    ['battery_level', 'TINYINT', '电量百分比'],
    ['online_status', 'TINYINT', '在线状态：1-在线 / 0-离线'],
    ['last_data_time', 'DATETIME', '最后数据时间'],
    ['status', 'TINYINT', '状态：1-启用 / 0-停用'],
])

# 5.2 iot_data
doc.add_heading('5.2 IoT数据表（iot_data）', level=4)
add_table(doc, ['字段名', '类型', '说明'], [
    ['data_id', 'BIGINT', '数据ID，主键，自增'],
    ['device_id', 'VARCHAR(32)', '设备ID'],
    ['temperature', 'DECIMAL(5,1)', '温度（°C）'],
    ['humidity', 'DECIMAL(5,1)', '湿度（%RH）'],
    ['is_alarm', 'TINYINT', '是否告警：1-是 / 0-否'],
    ['collect_time', 'DATETIME', '采集时间'],
])

# 5.3 iot_alarm
doc.add_heading('5.3 IoT告警表（iot_alarm）', level=4)
add_table(doc, ['字段名', '类型', '说明'], [
    ['alarm_id', 'VARCHAR(32)', '告警ID，主键'],
    ['device_id', 'VARCHAR(32)', '设备ID'],
    ['alarm_type', 'TINYINT', '类型：1-温度超标 / 2-湿度超标 / 3-设备离线 / 4-电量低'],
    ['alarm_value', 'DECIMAL(5,1)', '告警值'],
    ['threshold_value', 'DECIMAL(5,1)', '阈值'],
    ['alarm_time', 'DATETIME', '告警时间'],
    ['handle_status', 'TINYINT', '处理状态：1-未处理 / 2-已确认 / 3-已处理'],
    ['handle_by', 'VARCHAR(11)', '处理人手机号'],
    ['handle_time', 'DATETIME', '处理时间'],
])

# ==================== Section 6 ====================
doc.add_heading('6. 成品与包装（GSP交付·一码溯源）', level=3)

# 6.1 pkg_trace_code
doc.add_heading('6.1 包装赋码表（pkg_trace_code）', level=4)
doc.add_paragraph('操作场景：包装工扫生产工单码 → 系统带出成品信息 → 打印最小包装码 → 建立关联关系。')
add_table(doc, ['字段名', '类型', '说明'], [
    ['package_id', 'VARCHAR(32)', '包装ID，主键'],
    ['prod_batch_no', 'VARCHAR(20)', '成品批号，扫工单码自动带出'],
    ['final_trace_code', 'VARCHAR(200)', '最终追溯码，即印在包装上的二维码'],
    ['pack_spec', 'TINYINT', '包装规格：1-10g/袋 / 2-50g/盒 / 3-250g/袋 / 4-1kg/袋'],
    ['parent_code', 'VARCHAR(200)', '关联上级码，用于箱码关联袋码'],
    ['expire_date', 'DATE', '有效期至，系统根据生产日期+保质期自动计算'],
    ['status', 'TINYINT', '状态：1-在库 / 2-已出库'],
    ['create_time', 'DATETIME', '创建时间'],
])

# ==================== Section 7 ====================
doc.add_heading('7. 合规报告与审计', level=3)

# 7.1 rpt_compliance
doc.add_heading('7.1 合规报告表（rpt_compliance）', level=4)
add_table(doc, ['字段名', '类型', '说明'], [
    ['report_id', 'VARCHAR(32)', '报告ID，主键'],
    ['report_type', 'TINYINT', '类型：1-GAP批记录 / 2-GMP批记录 / 3-COA检验报告 / 4-物料平衡表'],
    ['related_batch_no', 'VARCHAR(20)', '关联批次号'],
    ['report_url', 'VARCHAR(200)', '报告PDF路径'],
    ['is_signed', 'TINYINT', '是否已签章：1-是 / 0-否'],
    ['is_submitted', 'TINYINT', '是否已上报监管：1-是 / 0-否'],
    ['create_time', 'DATETIME', '生成时间'],
])

# 7.2 sys_audit_trail
doc.add_heading('7.2 审计追踪表（sys_audit_trail）', level=4)
add_table(doc, ['字段名', '类型', '说明'], [
    ['audit_id', 'BIGINT', '审计ID，主键，自增'],
    ['table_name', 'VARCHAR(50)', '操作表名'],
    ['record_id', 'VARCHAR(32)', '操作记录ID'],
    ['action', 'TINYINT', '操作类型：1-新增 / 2-修改 / 3-删除 / 4-审批'],
    ['old_value', 'TEXT', '修改前值（JSON）'],
    ['new_value', 'TEXT', '修改后值（JSON）'],
    ['reason', 'VARCHAR(200)', '修改原因'],
    ['operator_mobile', 'VARCHAR(11)', '操作人手机号'],
    ['approver_mobile', 'VARCHAR(11)', '审批人手机号'],
    ['operator_ip', 'VARCHAR(50)', '操作IP'],
    ['device_fingerprint', 'VARCHAR(50)', '设备指纹'],
    ['operate_time', 'DATETIME', '操作时间'],
])

# ==================== Section: Business Logic ====================
doc.add_heading('三、「码码通」业务逻辑总图', level=2)

flow_lines = [
    '[用户] --(手机号登录)--> [码码通小程序]',
    '  |',
    '  |--(扫地块码)--> [带出地块档案] --(选农事类型/选项)--> [生成农事记录]',
    '  |',
    '  |--(扫采收码)--> [带出采收信息] --(选质检结果/选项)--> [生成入库单+物料码]',
    '  |',
    '  |--(扫物料码)--> [带出原料信息] --(选加工参数/选项)--> [生成生产指令+工单码]',
    '  |',
    '  |--(扫工单码)--> [带出成品信息] --(选包装规格/选项)--> [生成追溯码]',
    '',
    '最终形成：地块码 → 采收码 → 物料码 → 工单码 → 追溯码 的"万码互通"链条。',
]
for line in flow_lines:
    p = doc.add_paragraph()
    run = p.add_run(line)
    run.font.name = 'Consolas'
    run.font.size = Pt(9)

# ==================== Section: Data Entry Optimization ====================
doc.add_heading('四、数据录入优化说明（针对农户/工人）', level=2)
add_table(doc, ['优化策略', '说明'], [
    ['零录入', '所有基础信息（地块、种苗、农资）均由管理员在后台预制，工人只需扫码选择'],
    ['选项化', '所有可变数据（施肥量、打药倍数、质检结果）均采用下拉单选或多选，杜绝手写输入错误'],
    ['自动化', '日期、操作人、GPS、安全间隔期等字段均由系统自动抓取或计算，无需人工干预'],
    ['傻瓜式', '界面仅保留"扫码"、"拍照"、"选择"、"提交"四个按钮，确保零培训即可操作'],
])

# ==================== Section: Optimization Points ====================
doc.add_heading('五、与原版主要优化点', level=2)
add_table(doc, ['优化项', '原版问题', '优化内容'], [
    ['字段类型', '未标注数据类型', '所有字段标注 VARCHAR/DECIMAL/TINYINT/JSON/DATETIME'],
    ['工位记录', '用JSON数组存储在 prod_order 中', '拆分为独立表 prod_station_record，符合关系型数据库范式'],
    ['IoT管理', '缺少IoT相关表', '新增 iot_device、iot_data、iot_alarm 三张表'],
    ['合规报告', '缺少报告表', '新增 rpt_compliance 表'],
    ['审计追踪', '缺少审计表', '新增 sys_audit_trail 表，支持ALCOA+合规'],
    ['状态字段', '部分表缺少状态', '所有表统一增加 status 字段'],
    ['时间字段', '部分表缺少更新时间', '关键表增加 update_time、complete_time'],
    ['批次关联', '只有正向关联', '收购入库表同时存储 CJ 批次号和 YL 批次号，支持双向追溯'],
    ['GPS围栏', '农事记录缺少围栏校验', '所有农事记录增加 gps_location 和 in_fence 字段'],
    ['成本追踪', '缺少成本字段', '施肥记录增加 labor_cost、material_cost 字段'],
])

# ==================== Footer ====================
p = doc.add_paragraph()
p.add_run('\n')
p_footer = doc.add_paragraph()
run = p_footer.add_run('文档版本：V2.0（优化版）')
run.font.size = Pt(9)
run.font.color.rgb = RGBColor(128, 128, 128)
p_footer2 = doc.add_paragraph()
run2 = p_footer2.add_run('整理日期：2026年5月')
run2.font.size = Pt(9)
run2.font.color.rgb = RGBColor(128, 128, 128)
p_footer3 = doc.add_paragraph()
run3 = p_footer3.add_run('适用范围：河北好药中药饮片科技有限公司数字化项目实施')
run3.font.size = Pt(9)
run3.font.color.rgb = RGBColor(128, 128, 128)

outpath = 'D:/code_cys/mtong/河北好药数字化体系数据结构图（优化版·码码通专项）修改.docx'
doc.save(outpath)
print(f'Saved: {outpath}')
