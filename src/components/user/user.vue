<template>
<el-card shadow="always" class="user-card">
  <!-- 面包屑 -->
  <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ name: 'default' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb> -->
  <com-breadcrumb levelName1="用户管理" levelName2="用户列表"></com-breadcrumb>

  <!-- 搜索框 -->
  <el-row class="search">
    <el-col :span="8">
      <el-input placeholder="请输入内容" v-model="search" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="handleSearch()"></el-button>
      </el-input>
    </el-col>
    <el-col :span="4">
      <el-button type="success" plain class="addBtn" @click="showDialog('add')">添加用户</el-button>
    </el-col>
  </el-row>

  <!-- 数据列表 -->
  <el-table :data="users" v-loading="loading" border style="width: 100%" height="200px">
    <el-table-column type="index" width="50" label="#"></el-table-column>
    <el-table-column prop="username" label="姓名" width="100"></el-table-column>
    <el-table-column prop="email" label="邮箱"></el-table-column>
    <el-table-column prop="mobile" label="电话"></el-table-column>
    <el-table-column label="创建日期">
      <template slot-scope="scope">{{scope.row.create_time | fmtDate('YYYY-MM-DD')}}</template>
    </el-table-column>
    <el-table-column label="用户状态" width="150">
      <template slot-scope="scope">
        <el-switch v-model="scope.row.mg_state" @change="handleStateChange(scope.row)" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" plain circle size="mini" @click="showDialog('edit',scope.row.id)"></el-button>
        <el-button type="danger" icon="el-icon-delete" @click="handleDelete(scope.row.id)" plain circle size="mini"></el-button>
        <el-button type="success" icon="el-icon-check" plain circle size="mini" @click="showDialog('role',scope.row.id)"></el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页 -->
  <!-- 事件：size-change： 页码改变时会触发 -->
  <!-- 事件：current-change：当前页改变时会触发 -->
  <!-- 属性 current-page 指定当前页 -->
  <el-pagination class="pagging" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[2, 4, 6, 8]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>

  <!-- 添加用户对话框 -->
  <el-dialog title="添加用户" :visible.sync="addDialogFormVisible" width="30%" :center="true" :close-on-click-modal="false" :show-close="false">
    <el-form :model="formData" ref="addForm" status-icon :rules="rules">
      <el-form-item label="用户名:" label-width="120px" prop="username">
        <el-input v-model="formData.username"></el-input>
      </el-form-item>
      <el-form-item label="密码:" label-width="120px" prop="password">
        <el-input v-model="formData.password" show-password></el-input>
      </el-form-item>
      <el-form-item label="确认密码:" label-width="120px" prop="repassword">
        <el-input v-model="formData.repassword" show-password></el-input>
      </el-form-item>
      <el-form-item label="邮箱:" label-width="120px" prop="email">
        <el-input v-model="formData.email" type="email"></el-input>
      </el-form-item>
      <el-form-item label="手机号:" label-width="120px" prop="mobile">
        <el-input v-model="formData.mobile"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose('addForm','add')">取 消</el-button>
      <el-button type="primary" @click="handleAddUser()">确 定</el-button>
    </div>
  </el-dialog>

  <!-- 编辑用户对话框 -->
  <el-dialog title="编辑用户" :visible.sync="editDialogFormVisible" width="30%" :close-on-click-modal="false" :show-close="false">
    <el-form :model="formData" ref="editForm" status-icon :rules="rules">
      <el-form-item label="用户名:" label-width="120px">
        <el-input v-model="formData.username" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="邮箱:" label-width="120px" prop="email">
        <el-input v-model="formData.email" type="email"></el-input>
      </el-form-item>
      <el-form-item label="手机号:" label-width="120px" prop="mobile">
        <el-input v-model="formData.mobile"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose('editForm','edit')">取 消</el-button>
      <el-button type="primary" @click="handleEditUser()">确 定</el-button>
    </div>
  </el-dialog>

  <!-- 角色授权用户对话框 -->
  <el-dialog title="分配角色" ref="editForm" :visible.sync="roleDialogFormVisible" width="30%" :close-on-click-modal="false" :show-close="false">
    <el-form :model="formData" >
      <el-form-item label="用户名:" label-width="120px">
          {{formData.username}}
      </el-form-item>
      <el-form-item label="角色:" label-width="120px" prop="email">
        <el-select v-model="formData.rid" placeholder="请选择">
          <el-option
            v-for="item in roles"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose('roleForm','role')">取 消</el-button>
      <el-button type="primary" @click="handleRoleUser()">确 定</el-button>
    </div>
  </el-dialog>

</el-card>
</template>

<script>
export default {
  data() {
    // 自定义验证规则
    var validatePass = (rule, value, callback) => {
      if (value === undefined) {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.formData.password) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    }
    return {
      users: [], // 用户列表
      roles:[], //角色列表
      loading: true,
      search: "",
      pagenum: 1, // 页码
      pagesize: 2, // 页面条数
      total: -1, // 总条数
      addDialogFormVisible: false, // 控制添加对话框弹出
      editDialogFormVisible: false, // 控制编辑对话框弹出
      roleDialogFormVisible: false, // 控制角色对话框弹出
      formData: {}, // 添加用户表单
      // 添加用户验证规则
      rules: {
        username: [{
            required: true,
            message: "请输入用户名",
            trigger: "blur"
          },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        password: [{
            required: true,
            message: "请输入密码",
            trigger: "blur"
          },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur"
          }
        ],
        repassword: [{
          required: true,
          validator: validatePass,
          trigger: "blur"
        }],
        email: [{
          required: true,
          message: "请输入邮箱",
          trigger: "blur"
        }],
        mobile: [{
          required: true,
          message: "请输入手机号",
          trigger: "blur"
        }]
      }
    };
  },
  created() {
    // 页面创建加载数据
    this.loadData();
  },
  methods: {
    // 同步加载数据
    async loadData() {
      // query	查询参数	可以为空
      // pagenum	当前页码	不能为空
      // pagesize	每页显示条数	不能为空
      this.loading = true;
      // this.$http.defaults.headers.common["Authorization"] = localStorage.getItem("token")
      const res = await this.$http.get(
        `users?query=${this.search}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      const {
        data,
        meta: {
          msg,
          status
        }
      } = res.data;
      if (status === 200) {
        // 表格需要的数据
        this.users = data.users;
        // 分页总条数
        this.total = data.total;
        // this.$message.success(msg)
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
    },
    handleSearch() {
      // 页面重置
      this.pagenum = 1
      // 根据输入查询数据
      this.loadData(); // 重新刷新数据
    },
    handleStateChange(user) {
      // 状态按钮点击
      // 请求路径：users/:uId/state/:type
      // 请求方法：put
      this.$http
        .put(`users/${user.id}/state/${user.mg_state}`)
        .then(res => {
          const {
            data,
            meta: {
              msg,
              status
            }
          } = res.data;
          if (status === 200) {
            this.$message.success(msg);
          }
        })
        .catch(res => {});
    },
    handleDelete(id) {
      // 用户删除
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          // 请求路径：users/:id
          // 请求方法：delete
          this.$http
            .delete(`users/${id}`)
            .then(res => {
              const {
                data,
                meta: {
                  msg,
                  status
                }
              } = res.data;
              if (status === 200) {
                this.$message.success(msg);
                // 刷新数据
                this.loadData();
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    showDialog(type,id) {
      if (type === 'add') {
        // 点击打开添加用户的对话框
        this.addDialogFormVisible = true
      } else {
        // 需要根据ID查找
        this.$http.get(`users/${id}`)
          .then(res=>{
            this.formData = res.data.data
          }).catch(res=>{})
        // 如果是编辑和修改 都需要根据ID查找
        if(type === "edit"){
          // 点击打开编辑用户的对话框
          this.editDialogFormVisible = true
        }else{ 
          // 点击角色编辑用户的对话框
          this.roleDialogFormVisible = true
          // 加载角色列表
          this.$http.get(`roles`)
          .then(res=>{
            this.roles = res.data.data
          }).catch(res=>{})
        }
      }
    },
    handleAddUser() {
      this.$refs["addForm"].validate(valid => {
        if (valid) {
          // 添加用户
          // 请求路径：users
          // 请求方法：post
          this.$http
            .post("users", this.formData)
            .then(res => {
              const {
                meta: {
                  msg,
                  status
                }
              } = res.data;
              if (status === 201) {
                this.$message.success(msg);
                // 关闭对话框
                this.addDialogFormVisible = false;
                // 清空数据
                this.formData = {}
                // 刷新数据
                this.loadData()
              }
            })
            .catch(res => {})
        } else {
          return false;
        }
      });
    },
    handleEditUser() {
      this.$refs["editForm"].validate(valid => {
        if (valid) {
          // 添加用户
          // 请求路径：users/:id
          // 请求方法：put
          this.$http
            .put(`users/${this.formData.id}`, this.formData)
            .then(res => {
              const {
                meta: {
                  msg,
                  status
                }
              } = res.data;
              if (status === 200) {
                this.$message.success(msg);
                // 关闭对话框
                this.editDialogFormVisible = false;
                // 清空数据
                this.formData = {}
                // 刷新数据
                this.loadData()
              }
            })
            .catch(res => {})
        } else {
          return false;
        }
      });
    },
    handleRoleUser(){
      // 分配角色
      this.$http
        .put(`users/${this.formData.id}/role`,'rid='+this.formData.rid)
        .then(res => {
          const {
            meta: {
              msg,
              status
            }
          } = res.data;
          if (status === 200) {
            this.$message.success(msg)
            // 关闭对话框
            this.roleDialogFormVisible = false
            // 清空数据
            this.formData = {}
            // 刷新数据
            this.loadData()
          }else{
            this.$message.error(msg)
          }
        })
        .catch(res => {})
    },
    handleClose(formName,type) { // 关闭对话框
      if(formName !== 'roleForm'){
        // 重置表单
        this.$refs[formName].resetFields()
      }
      // 关闭对话框
      if(type==='edit'){
          this.editDialogFormVisible = false
      }else if(type==='add'){
          this.addDialogFormVisible = false
      }else{
        this.roleDialogFormVisible = false
        this.roles = []
      }
      // 必须清空数据,否则表单会陷入卡死状态
      this.formData = {}
    }
  }
};
</script>

<style scoped>
/* .user-card{
  height: 100%;
} */
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
