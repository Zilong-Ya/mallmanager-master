<template>
<el-card shadow="always">
  <!-- 面包屑导航 -->
  <com-breadcrumb levelName1="权限管理" levelName2="角色列表"></com-breadcrumb>
  <!-- 添加角色按钮 -->
  <el-button @click="handleShowRole()">添加角色</el-button>
  <!-- 角色列表 -->
  <el-table :data="roles" style="width: 100%" v-loading="loading">
    <el-table-column type="expand">
      <template slot-scope="scope">
        <!-- 遍历一级标签 多row -->
        <el-row v-for="(item1, index) in scope.row.children" :key="index">
          <el-col :span="3">
            <el-tag closable @close="handleTagClose(scope.row,item1.id)">
              {{item1.authName}}
            </el-tag>
            <i class="el-icon-arrow-right"></i>
          </el-col>
          <el-col :span="21">
            <!-- 遍历二级标签 多row -->
            <el-row v-for="(item2, index) in item1.children" :key="index">
              <el-col :span="3">
                <el-tag closable type="success" @close="handleTagClose(scope.row,item2.id)">
                  {{item2.authName}}
                </el-tag>
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <el-col :span="21">
                <!-- 遍历三级标签 多col -->
                <el-tag closable v-for="(item3, index) in item2.children" :key="index" type="warning" @close="handleTagClose(scope.row,item3.id)">
                  {{item3.authName}}
                </el-tag>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <!-- 处理没有权限时 -->
        <p class="nodata" v-if="scope.row.children.length===0">没有对应权限，请添加!</p>

      </template>
    </el-table-column>
    <el-table-column type="index" label="#" width="50">
    </el-table-column>
    <el-table-column prop="roleName" label="角色名称">
    </el-table-column>
    <el-table-column prop="roleDesc" label="角色描述">
    </el-table-column>
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" @click="handleShowRole(scope.row.id)" plain circle size="mini"></el-button>
        <el-button type="danger" icon="el-icon-delete" @click="handleDeleteRole(scope.row.id)" plain circle size="mini"></el-button>
        <el-button type="success" icon="el-icon-check" @click="handleShowRights(scope.row)" plain circle size="mini"></el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 添加角色对话框 -->
  <el-dialog title="添加角色" :visible.sync="addDialogFormVisibleRole" width="30%" @close="handleClose('addForm')">
  <el-form :model="formdata" :rules="rules" ref="addForm" >
    <el-form-item label="角色名称" label-width="120px" prop="roleName">
      <el-input v-model="formdata.roleName" placeholder="请输入名称" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="角色描述" label-width="120px"  prop="roleDesc">
      <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="formdata.roleDesc"></el-input>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="handleClose('addForm')">取 消</el-button>
    <el-button type="primary" @click="handleSubmitAdd('addForm')">确 定</el-button>
  </div>
</el-dialog>


<!-- 编辑角色对话框 -->
  <el-dialog title="编辑角色" :visible.sync="editDialogFormVisibleRole" width="30%" @close="handleClose('editForm')">
  <el-form :model="formdata" :rules="rules" ref="editForm" >
    <el-form-item label="编号" label-width="120px">
       {{formdata.roleId}}
    </el-form-item>
    <el-form-item label="角色名称" label-width="120px" prop="roleName">
      <el-input v-model="formdata.roleName" placeholder="请输入名称" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="角色描述" label-width="120px"  prop="roleDesc">
      <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="formdata.roleDesc"></el-input>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="handleClose('editForm')">取 消</el-button>
    <el-button type="primary" @click="handleSubmitEdit('editForm')">确 定</el-button> 
  </div>
</el-dialog>

<!-- 分配权限 -->
<!-- 编辑角色对话框 -->
  <el-dialog title="分配权限" :visible.sync="rightsDialogFormVisibleRole" width="30%" @open="handleRights()" @close="handleRightsClose()">
  <!-- 树状菜单 -->
  <el-tree
  v-loading="loading"
  :data="datarights"
  :default-checked-keys="checkedList"
  show-checkbox
  default-expand-all
  node-key="id"
  ref="tree"
  highlight-current
  :props="defaultProps">
</el-tree>
  <div slot="footer" class="dialog-footer">
    <el-button @click="rightsDialogFormVisibleRole=false">取 消</el-button>
    <el-button type="primary" @click="handleSubmitRights()">确 定</el-button> 
  </div>
</el-dialog>

</el-card>
</template>

<script>
export default {
  data() {
    return {
      roles: [], // 角色列表
      datarights:[], // 权限列表 
      checkedList:[], // 选中角色默认的权限列表 
      currentRoleId:[], // 要操作的角色ID
      loading: false, // 加载数据时显示动画
      addDialogFormVisibleRole:false, // 添加角色对话框
      editDialogFormVisibleRole:false, // 编辑角色对话框
      rightsDialogFormVisibleRole:false, // 分配权限对话框
      formdata:{}, // 表单对象
      defaultProps:{ // 树状菜单配置
        children: 'children',  // datarights 子元素集合的名称
        label: 'authName' // 显示树状菜单的标签名称
      },
      // 验证规则
       rules: {
          roleName: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请选择描述信息', trigger: 'change' }
          ],
        }
    }
  },
  created() {
    // 加载数据
    this.loadDataRole()
  },
  methods: {
    async loadDataRole() { // 同步加载
      this.loading = true
      const res = await this.$http.get(`roles`)
      const {
        data,
        meta: {
          msg,
          status
        }
      } = res.data;
      if (status === 200) {
        this.roles = data
      } else {
        this.$message.error(msg)
      }
      this.loading = false
    },
    handleTagClose(role, rightId) { // 关闭权限标签
      this.$confirm('取消该角色的权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`roles/${role.id}/rights/${rightId}`).
        then(res => {
          const {
            data,
            meta: {
              msg,
              status
            }
          } = res.data;
          if (status === 200) {
            this.$message.success(msg)
            // 刷新权限信息 重新渲染标签
            role.children = data
          } else {
            this.$message.error(msg)
          }
        }).catch(() => {})
      }).catch(() => {})
    },
    handleShowRole(id){  // 显示添加角色对话框
      if(id!==undefined){
        // 根据ID查询信息 赋值到编辑框的表单
        this.$http.get(`roles/${id}`)
          .then(res=>{
              this.formdata = res.data.data
              // 编辑框
              this.editDialogFormVisibleRole = true
          }).catch(res=>{})
      }else{
        // 添加框
        this.addDialogFormVisibleRole = true
      }
     
    }, 
    handleSubmitAdd(formName){ // 添加请求
        this.$refs[formName].validate((valid) => {
          if (valid) {
             // 发送请求 请求路径：roles 请求方法：post
             this.$http.post(`roles`,this.formdata)
              .then(res=>{
                const {
                  data,
                  meta: {
                    msg,
                    status
                  }
                } = res.data
                if (status  === 201) {
                    this.$message.success(msg)
                    // 刷新数据
                    this.loadDataRole()
                    // 关闭表单
                    this.handleClose(formName)
                }else{
                  this.$message.error(msg)
                }
              }).catch(res=>{})
          } else {
            return false;
          }
        })
    },
    handleSubmitEdit(formName){ // 编辑请求
        this.$refs[formName].validate((valid) => {
          if (valid) {
             // 发送请求 请求路径：roles 请求方法：post
             this.$http.put(`roles/${this.formdata.roleId}`,this.formdata)
              .then(res=>{
                const {
                  data,
                  meta: {
                    msg,
                    status
                  }
                } = res.data
                if (status  === 200) {
                    this.$message.success(msg)
                    // 刷新数据
                    this.loadDataRole()
                    // 关闭表单
                    this.handleClose(formName)
                }else{
                  this.$message.error(msg)
                }
              }).catch(res=>{})
          } else {
            return false;
          }
        })
    },
    handleClose(formName){  // 关闭对话框
      if(formName==="addForm"){
       // 关闭添加对话框
       this.addDialogFormVisibleRole = false 
      }else{
        // 关闭编辑对话框
       this.editDialogFormVisibleRole = false 
      }
       // 重置表单
       this.$refs[formName].resetFields() 
       // 重置对象
       this.formdata = {}  
       
    },
    handleDeleteRole(id){  // 删除角色
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
           this.$http.delete(`roles/${id}`)
            .then(res=>{
              var {meta:{status,msg}} = res.data
               if(status===200){
                 this.loadDataRole() // 刷新数据
                 this.$message.success(msg)
               }else{
                 this.$message.error(msg)
               }
            }).catch()
        }).catch(() => {})
    },
    handleShowRights(role){  // 打开权限列表  role 当前的角色对象
      // 保存角色ID
      this.currentRoleId = role.id
      // 清空之前保存的数组
      this.checkedList =[]
      // 遍历对象，获取当前角色所属权限
      role.children.forEach(item1=>{
         item1.children.forEach(item2=>{
           item2.children.forEach(item3=>{
             // 只需要接收第三级，第二级和第一级自动
            this.checkedList.push(item3.id)
          })
         })
      })
      this.rightsDialogFormVisibleRole = true
    },
    async handleRights(){  // 当对话框被弹出，获取所有权限数据
      this.loading = true
      const res = await this.$http.get('rights/tree')
      this.datarights = res.data.data
      this.loading = false
    },
    async handleSubmitRights(){  // 发送请求 授权
        // 1.获取roleId
        // console.log('roleId=>'+this.currentRoleId)
        // 2.获取权限列表 当前选中的树状菜单项
        // 2.1 获取全选ID集合
        let arr1 = this.$refs.tree.getCheckedKeys()
        // 2.2 获取半选ID集合
        let arr2 = this.$refs.tree.getHalfCheckedKeys()
        // 2.3 合并数组  ... Es6提供的展开运算符
        let checks = [...arr1,...arr2]
        // 请求路径：roles/:roleId/rights
        // 请求方法：post  => rids	权限 ID 列表	以 , 分割的权限 ID 列表
        let res = await this.$http.post(`roles/${this.currentRoleId}/rights`,'rids='+checks.join(','))
        const {meta:{msg,status}} = res.data
        if(status===200){
          this.$message.success(msg)
          // 刷新数据
          this.loadDataRole()
        }else{
          this.$message.error(msg)
        }
        this.rightsDialogFormVisibleRole = false
    },
    handleRightsClose(){  // 清空数据
      this.datarights = []
      this.checkedList = []
    }
  },
}
</script>

<style scoped>
.el-tag {
  margin: 5px;
}

.nodata {
  text-align: center;
  color: #F56C6C;
}
</style>
