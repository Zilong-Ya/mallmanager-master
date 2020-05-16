<template>
<el-card shadow="always" class="goods-card">
    <!-- 面包屑 -->
    <com-breadcrumb levelName1="商品管理" levelName2="商品分类"></com-breadcrumb>

    <!-- 新建分类按钮 -->
    <el-button class="addBtn" type="success" @click="handleShowAddDialog">添加分类</el-button>

    <!-- 数据列表 -->
    <el-table :data="cates" v-loading="loading" border style="width: 100%" height="500px">
        <!-- <el-table-column prop="cat_name" label="分类名称"></el-table-column> -->
        <!-- 
            childKey="children" 标识子节点
            treeKey 绑定到id 给每个节点设置一个唯一值
            parentKey 绑定到父id属性 区分父子节点
            levelKey 绑定到层级的属性
         -->
        <el-tree-grid treeKey="cat_id" parentKey="cat_pid" levelKey="cat_level" childKey="children" file-icon="icon icon-file" folder-icon="icon icon-folder" prop="cat_name" label="分类名称" width="220"></el-tree-grid>
        <el-table-column label="级别">
            <template slot-scope="scope">
                <!-- 级别判断 -->
                <span v-if="scope.row.cat_level === 0">一级</span>
                <span v-else-if="scope.row.cat_level === 1">二级</span>
                <span v-else-if="scope.row.cat_level === 2">三级</span>
            </template>
        </el-table-column>
        <el-table-column label="是否有效">
            <template slot-scope="scope">
                <!-- 有效处理 -->
                {{scope.row.cat_deleted?'无效':'有效'}}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
            <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" plain circle size="mini"  @click="handleEditShow(scope.row)"></el-button>
                <el-button type="danger" icon="el-icon-delete" plain circle size="mini" @click="handleDelete(scope.row.cat_id)"></el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!-- 事件：size-change： 页码改变时会触发 -->
    <!-- 事件：current-change：当前页改变时会触发 -->
    <!-- 属性 current-page 指定当前页 -->
    <el-pagination class="pagging" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[10, 20, 30, 40]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>

    <!-- 添加商品的对话框 -->
    <el-dialog title="添加商品分类" :visible.sync="addDialogFormVisible" width="40%">
        <el-form :model="formData" label-width="100px">
            <el-form-item label="分类名称">
                <el-input v-model="formData.cat_name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="分类">
                <!-- change-on-select 过期 -->
                <el-cascader clearable :options="options" v-model="selectedOptions" :props="defaultProps">
                </el-cascader> <span>分类不选择，即为根级</span>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="addDialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleAddCate">确 定</el-button>
        </div>
    </el-dialog>

    <!-- 修改商品的对话框 -->
    <el-dialog title="修改商品分类" :visible.sync="editDialogFormVisible" width="40%">
        <el-form :model="formData" label-width="100px">
            <el-form-item label="分类名称">
                <el-input v-model="formData.cat_name" auto-complete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="editDialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleEditCate">确 定</el-button>
        </div>
    </el-dialog>

</el-card>
</template>

<script>
// 引入data-grid
var ElTreeGrid = require('element-tree-grid')

export default {
    data() {
        return {
            cates: [], // 商品分类列表
            loading: true,
            pagenum: 1, // 页码
            pagesize: 10, // 页面条数
            total: -1, // 总条数
            addDialogFormVisible: false, // 添加商品分类
            editDialogFormVisible: false, // 修改商品分类
            options: [], // 分类列表
            selectedOptions: [], // 分类选中结果
            defaultProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: true, // 支持单选
                expandTrigger: 'hover' // 鼠标悬浮选中
            }, // 分类显示内容
            formData: {
                cat_pid: '', // 分类父ID
                cat_name: '', // 分类名称
                cat_level: '', // 分类层级
            },
        }
    },
    components: {
        ElTreeGrid,
    },
    created() {
        // 页面创建加载数据
        this.loadData();
    },
    methods: {
        // 修改商品分类
        async handleEditCate(){
            const res = await this.$http.put(`categories/${this.formData.cat_id}`, this.formData)
            const {
                data,
                meta: {
                    msg,
                    status
                }
            } = res.data
            if (status === 200) {
                // 刷新数据
                this.loadData()
                this.editDialogFormVisible = false
                // 重置数据
                this.formData = {
                    cat_id: '',
                    cat_name: '',
                }
            }
        },
        // 显示修改商品分类
        handleEditShow(cat){
            console.log(cat)
            this.editDialogFormVisible = true
            this.formData = {
                cat_id: cat.cat_id,
                cat_name: cat.cat_name
            }
        },
        // 删除分类信息
        handleDelete(id) {
            console.log(id)
            this.$confirm("此操作将永久删除该商品分类, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                .then(() => {
                    this.$http
                        .delete(`categories/${id}`)
                        .then(res => {
                            const {
                                data,
                                meta: {
                                    msg,
                                    status
                                }
                            } = res.data;
                            if (status === 200) {
                                console.log(data)
                                
                                this.$message.success(msg);
                                // 刷新数据
                                this.loadData();
                            }
                        })
                        .catch(res => {});
                })
                .catch(() => {});
        },
        // 添加分类信息
        async handleAddCate() {
            // 处理分类父ID ， 分类层级
            if (this.selectedOptions.length === 0) { // 没有选中分类信息 , 第一级
                this.formData.cat_pid = 0
                this.formData.cat_level = 0
            } else if (this.selectedOptions.length === 1) { // 选中了一级分类
                this.formData.cat_pid = this.selectedOptions[0]
                this.formData.cat_level = 1
            } else if (this.selectedOptions.length === 2) { // 选中了二级分类
                this.formData.cat_pid = this.selectedOptions[1]
                this.formData.cat_level = 2
            }
            // 添加分类
            // 请求路径：categories
            //  请求方法：post
            const res = await this.$http.post(`categories`, this.formData)
            const {
                data,
                meta: {
                    msg,
                    status
                }
            } = res.data
            if (status === 201) {
                // 刷新数据
                this.loadData()
                this.addDialogFormVisible = false
                this.formData = {
                    cat_pid: '',
                    cat_name: '',
                    cat_level: '',
                }
            }
        },
        //显示添加分类对话框
        async handleShowAddDialog() {
            this.addDialogFormVisible = true
            // 查询数据得到分类信息
            const res = await this.$http.get(
                `categories?type=2`
            )
            this.options = res.data.data
            console.log(res)
        },
        // 同步加载数据
        async loadData() {
            this.loading = true;
            const res = await this.$http.get(
                `categories?type=3&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
            );
            const {
                data,
                meta: {
                    msg,
                    status
                }
            } = res.data
            if (status === 200) {
                console.log(data)
                // 表格需要的数据
                this.cates = data.result
                // 分页总条数
                this.total = data.total
                // 分页页码
                this.pagenum = data.pagenum
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
    margin-bottom: 10px;
}

.pagging {
    margin: 40px 0px;
    text-align: center;
}
</style>
