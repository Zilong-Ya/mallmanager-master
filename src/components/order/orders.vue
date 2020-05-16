<template>
<el-card shadow="always" class="goods-card">
    <!-- 面包屑 -->
    <com-breadcrumb levelName1="订单管理" levelName2="订单列表"></com-breadcrumb>

    <!-- 数据列表 -->
    <el-table :data="orders" v-loading="loading" border style="width: 100%" height="500px">
        <el-table-column type="index" width="50" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
            <template slot-scope="scope">
                <!-- 标签 el-tag -->
                <el-tag v-if="scope.row.pay_status === '0'">未付款</el-tag>
                <el-tag v-else-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
            <template slot-scope="scope">{{scope.row.create_time | fmtDate('YYYY-MM-DD')}}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
            <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" plain circle size="mini" @click="handleShowDialog(scope.row.order_id)"></el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!-- 事件：size-change： 页码改变时会触发 -->
    <!-- 事件：current-change：当前页改变时会触发 -->
    <!-- 属性 current-page 指定当前页 -->
    <el-pagination class="pagging" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[10, 20, 30, 40]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    <!-- 编辑订单对话框 -->
    <el-dialog title="编辑订单" :visible.sync="dialogFormVisible" width="40%" @close="handleCloseDislog">
        <el-form :model="formdata">
            <el-form-item label="订单号:" label-width="120px">
                {{formdata.order_number}}
            </el-form-item>
            <el-form-item label="是否发货:" label-width="120px">
                <!-- 开关 -->
                <el-switch v-model="formdata.is_send" active-value="是" inactive-value="否" active-color="#13ce66" inactive-color="#ff4949">
                </el-switch>
            </el-form-item>
            <el-form-item label="订单支付:" label-width="120px">
                <!-- 选项 -->
                <el-radio-group v-model="formdata.order_pay">
                    <el-radio label="0">未支付</el-radio>
                    <el-radio label="1">支付宝</el-radio>
                    <el-radio label="2">微信</el-radio>
                    <el-radio label="3">银行卡</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="订单价格:" label-width="120px">
                <el-input v-model="formdata.order_price" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="送货地址:" label-width="120px">
                <el-cascader :options="options" v-model="selectOptions" clearable></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址:" label-width="120px">
                <el-input v-model="formdata.address" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleEditOrder()">确 定</el-button>
        </div>
    </el-dialog>
</el-card>
</template>

<script>
// 导入省市区
import {
    regionDataPlus,
    CodeToText
} from 'element-china-area-data'

export default {
    data() {
        return {
            orders: [], // 订单列表
            loading: true,
            pagenum: 1, // 页码
            pagesize: 10, // 页面条数
            total: -1, // 总条数
            dialogFormVisible: false, // 编辑对话框
            formdata: {
                order_id: '',
                order_number: '',
                order_price: '',
                order_pay: '',
                is_send: '',
                consignee_addr: '',
                pay_status: '',
                address: ''
            }, // 表单数据
            selectOptions: [], // 选中省市区
            options: regionDataPlus // 省市区的数据
        }
    },
    created() {
        // 页面创建加载数据
        this.loadData()
    },
    methods: {
        // 关闭对话框
        handleCloseDislog() {
            this.selectOptions = []
            this.formdata = {}
            this.dialogFormVisible = false
        },
        // 修改订单
        async handleEditOrder() {
            // 支付状态
            if (this.formdata.order_pay !== 0) {
                this.formdata.pay_status = '1' // 已支付
            } else {
                this.formdata.pay_status = '0' // 未支付
            }
            // 处理地址  = 送货地址 + 详细地址
            if (this.selectOptions.length !== 0 && this.formdata.address !== undefined) {
                this.formdata.consignee_addr = this.selectOptions.join(',') + ',' + this.formdata.address
            } else {
                this.formdata.consignee_addr = ''
            }
            // 处理是否发货
            this.formdata.is_send = this.formdata.is_send === '是' ? 1 : 0

            const res = await this.$http.put(
                `orders/${this.formdata.order_id}`, this.formdata
            )
            const {
                data,
                meta: {
                    msg,
                    status
                }
            } = res.data
            if (status === 201) {
                // 清空数据
                this.formdata = {}
                this.selectOptions = []
                // 刷新数据
                this.loadData()
                this.dialogFormVisible = false
            }

        },
        // 点击编辑按钮
        async handleShowDialog(order_id) {
            const res = await this.$http.get(
                `orders/${order_id}`
            )
            const {
                data,
                meta: {
                    msg,
                    status
                }
            } = res.data
            if (status === 200) {
                // 打开对话框
                this.dialogFormVisible = true
                // 赋值数据
                this.formdata = {
                    order_id: data.order_id,
                    order_price: data.order_price,
                    order_pay: data.order_pay,
                    is_send: data.is_send,
                    consignee_addr: data.consignee_addr,
                    pay_status: data.pay_status,
                    order_number: data.order_number,
                }
                // 处理地址
                if (data.consignee_addr !== '') {
                    // 420000,420100,420102,二七路
                    let addrs = data.consignee_addr.split(',')
                    // 删除最后一个元素 pop()返回删除的元素
                    this.formdata.address = addrs.pop()
                    this.selectOptions = addrs
                }
            }
        },
        // 同步加载数据
        async loadData() {
            this.loading = true;
            const res = await this.$http.get(
                `orders?pagenum=${this.pagenum}&pagesize=${this.pagesize}`
            );
            const {
                data,
                meta: {
                    msg,
                    status
                }
            } = res.data
            if (status === 200) {
                // 表格需要的数据
                this.orders = data.goods
                // 分页总条数
                this.total = data.total
            } else {
                this.$message.error(msg);
            }
            this.loading = false;
        },
        handleSizeChange(val) {
            // 页面条数发生改变时
            this.pagesize = val;
            this.loadData(); // 重新刷新数据
        },
        handleCurrentChange(val) {
            // 当前页码发生改变时
            this.pagenum = val;
            this.loadData(); // 重新刷新数据
        }
    }
}
</script>

<style scoped>
.search {
    margin: 20px 0px;
}

.addBtn {
    margin-left: 10px;
}

.pagging {
    margin: 40px 0px;
    text-align: center;
}
</style>
