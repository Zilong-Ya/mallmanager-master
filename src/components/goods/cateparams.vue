<template>
  <el-card shadow="always" class="goods-card">
    <!-- 面包屑 -->
    <com-breadcrumb levelName1="商品管理" levelName2="分类参数"></com-breadcrumb>
    <el-alert class="alert" title="只允许为三级分类设置参数" type="error"></el-alert>
    <!-- 分类参数 -->
    <span>商品分类:</span>
    <el-cascader
      :options="options"
      :show-all-levels="false"
      clearable
      :props="defaultProps"
      v-model="selectOptionsValues"
      @change="handleChange()"
    ></el-cascader>
    <!-- 参数标签页 -->
    <el-tabs tab-position="top" type="card" v-model="active" class="tabs">
      <el-tab-pane label="动态参数" name="1">
        <!-- 按钮 -->
        <el-button type="danger" @click="dialogFormVisibleDy=true">设置动态参数</el-button>
        <!-- 表格 -->
        <el-table :data="arrgDyParams">
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 动态属性 el-tag -->
              <el-row>
                <el-col :span="24">
                  <el-tag
                    class="tag"
                    :key="tag"
                    v-for="(tag,i) in scope.row.attr_vals"
                    closable
                    :disable-transitions="false"
                    @close="handleTagClose(i,scope.row)"
                  >{{tag}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="inputVisible"
                    v-model="inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column label="#" type="index" width="100px"></el-table-column>
          <el-table-column label="属性名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                plain
                circle
                size="mini"
                @click="handleDyShow(scope.row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                plain
                circle
                size="mini"
                @click="handleDyDelete(scope.row.attr_id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="静态参数" name="2">
        <!-- 按钮 -->
        <el-button type="danger" @click="dialogFormVisibleSt = true">设置静态参数</el-button>
        <!-- 表格 -->
        <el-table :data="arrgStaticsParams">
          <el-table-column label="#" type="index" width="100px"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="参数值" prop="attr_vals"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                plain
                circle
                size="mini"
                @click="handleStShow(scope.row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                plain
                circle
                size="mini"
                @click="handleStDelete(scope.row.attr_id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 动态参数 对话框 -->
    <el-dialog
      :title="(isDyEdit?'修改':'添加')+'动态参数'"
      :visible.sync="dialogFormVisibleDy"
      width="30%"
      @closed="handleDyDialogClose()"
    >
      <el-form :model="formDyData">
        <el-form-item label="参数名称" label-width="120px">
          <el-input v-model="formDyData.attr_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="参数属性" label-width="120px">
          <el-row>
            <el-col :span="20">
              <el-input v-model="formDyData.attr_vals" autocomplete="off"></el-input>
            </el-col>
            <el-col :span="4">
              <span>以","分割</span>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleDy = false">取 消</el-button>
        <el-button type="primary" @click="handleEditDyParams()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 静态参数 对话框 -->
    <el-dialog
      :title="(isStEdit?'修改':'添加')+'静态参数'"
      :visible.sync="dialogFormVisibleSt"
      width="30%"
      @closed="handleStDialogClose()"
    >
      <el-form :model="formStData">
        <el-form-item label="参数名称" label-width="120px">
          <el-input v-model="formStData.attr_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="参数属性" label-width="120px">
          <el-input v-model="formStData.attr_vals" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleSt = false">取 消</el-button>
        <el-button type="primary" @click="handleEditStParams()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      active: "1",
      options: [], // 分类列表
      defaultProps: {
        // 级联列表默认属性
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      selectOptionsValues: [], // 绑定选中值
      arrgDyParams: [], // 动态参数
      arrgStaticsParams: [], // 静态参数
      inputVisible: false,
      inputValue: "",
      dialogFormVisibleDy: false, // 动态参数对话框
      dialogFormVisibleSt: false, // 静态参数对话框
      formDyData: {
        attr_name: "",
        attr_sel: "many",
        attr_vals: ""
      }, // 动态参数表单
      formStData: {
        attr_name: "",
        attr_sel: "only",
        attr_vals: ""
      }, // 静态参数表单
      isDyEdit: false, // 是否修改动态参数
      isStEdit: false // 是否修改静态参数
    }
  },
  created() {
    // 加载三级分类
    this.loadDataCategory()
  },
  methods: {
    /**
     * 点击添加标签
     */
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    /**
     * 处理添加标签 （回车，失去焦点）
     */
    handleInputConfirm(params) {
      let inputValue = this.inputValue;
      if (inputValue) {
        // 添加一个标签
        params.attr_vals.push(inputValue);
        // 发送请求
        const putData = {
          attr_name: params.attr_name,
          attr_sel: params.attr_sel,
          attr_vals: params.attr_vals.join(",")
        };
        this.$http
          .put(
            `categories/${params.cat_id}/attributes/${params.attr_id}`,
            putData
          )
          .then(res => {
            if (res.status === 200) {
              this.$message.success("添加成功!");
            }
          });
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    /**
     * 点击关闭标签
     */
    handleTagClose(i, params) {
      // 当前动态参数attr_vals移除要删除的属性
      params.attr_vals.splice(i, 1);
      // 请求路径：categories/:id/attributes/:attrId
      // 请求方法：put
      // 将数组还原成字符串
      const putData = {
        attr_name: params.attr_name,
        attr_sel: params.attr_sel,
        attr_vals: params.attr_vals.join(",")
      };
      this.$http
        .put(
          `categories/${params.cat_id}/attributes/${params.attr_id}`,
          putData
        )
        .then(res => {
          if (res.status === 200) {
            this.$message.success("删除成功!");
          }
        });
    },
    /**
     * 加载三级分类
     */
    async loadDataCategory() {
      const res = await this.$http.get(`categories?type=3`);
      this.options = res.data.data;
    },
    /**
     * 获取动态参数
     */
    async loadDyParamsData() {
      let res = await this.$http.get(
        `categories/${this.selectOptionsValues[2]}/attributes?sel=many`
      );
      this.arrgDyParams = res.data.data;
      // 处理attr_vals 以，分割成数组
      if (this.arrgDyParams != null) {
        this.arrgDyParams.forEach(param => {
          if (param.attr_vals.trim() != "")
            param.attr_vals =
              param.attr_vals.trim().split(",").length === 0
                ? []
                : param.attr_vals.trim().split(",");
        });
      }
    },
    /**
     * 获取静态参数
     */
    async loadStParamsData() {
      // 根据分类ID发送请求得到 商品的静态参数
      let res = await this.$http.get(
        `categories/${this.selectOptionsValues[2]}/attributes?sel=only`
      );
      this.arrgStaticsParams = res.data.data;
    },
    /**
     * 当三级分类改变时，加载动态参数与静态参数
     */
    async handleChange() {
      if (this.selectOptionsValues.length === 3) {
        this.loadDyParamsData();
        this.loadStParamsData();
      } else {
        this.$message.error("请先选择分类信息");
      }
    },
    // 添加或修改动态参数
    async handleEditDyParams() {
      if (this.selectOptionsValues.length === 3) {
        if (this.isDyEdit) {
          // 修改
          let res = await this.$http.put(
            `categories/${this.selectOptionsValues[2]}/attributes/${this.formDyData.attr_id}`,
            this.formDyData
          );
          if (res.data.meta.status === 200) {
            // 刷新动态参数
            this.loadDyParamsData();
          }
        } else {
          // 添加
          let res = await this.$http.post(
            `categories/${this.selectOptionsValues[2]}/attributes`,
            this.formDyData
          );
          if (res.data.meta.status === 201) {
            // 刷新动态参数
            this.loadDyParamsData();
          }
        }
        this.dialogFormVisibleDy = false;
      } else {
        this.$message.error("请先选择分类信息");
      }
    },
    // 删除动态参数
    handleDyDelete(dyId) {
      this.$confirm("此操作将永久删除该信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 请求路径：categories/:id/attributes/:attrid
          // 请求方法：delete
          this.$http
            .delete(
              `categories/${this.selectOptionsValues[2]}/attributes/${dyId}`
            )
            .then(res => {
              if (res.data.meta.status === 200) {
                // 刷新动态参数
                this.loadDyParamsData();
                this.$message.success("删除成功");
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 显示动态修改对话框
    handleDyShow(dy) {
      // 修改标识符
      this.isDyEdit = true;
      this.dialogFormVisibleDy = true;
      this.formDyData = {
        attr_id: dy.attr_id,
        attr_name: dy.attr_name,
        attr_sel: "many",
        attr_vals: dy.attr_vals.length == 0 ? "" : dy.attr_vals.join(",")
      };
    },
    // 关闭动态对话框
    handleDyDialogClose() {
      this.isDyEdit = false;
      this.formDyData = {
        attr_id: "",
        attr_name: "",
        attr_sel: "many",
        attr_vals: ""
      };
    },
    // 添加静态参数
    async handleEditStParams() {
      if (this.selectOptionsValues.length === 3) {
        if (this.isStEdit) {
          // 修改
          let res = await this.$http.put(
            `categories/${this.selectOptionsValues[2]}/attributes/${this.formStData.attr_id}`,
            this.formStData
          );
          if (res.data.meta.status === 200) {
            // 刷新静态参数
            this.loadStParamsData();
          }
        } else {
          // 添加
          let res = await this.$http.post(
            `categories/${this.selectOptionsValues[2]}/attributes`,
            this.formStData
          );
          if (res.data.meta.status === 201) {
            // 刷新静态参数
            this.loadStParamsData();
          }
        }
        this.dialogFormVisibleSt = false;
      } else {
        this.$message.error("请先选择分类信息");
      }
    },
    // 显示静态修改对话框
    handleStShow(st) {
      // 修改标识符
      this.isStEdit = true;
      this.dialogFormVisibleSt = true;
      this.formStData = {
        attr_id: st.attr_id,
        attr_name: st.attr_name,
        attr_sel: "only",
        attr_vals: st.attr_vals
      };
    },
    // 关闭静态对话框
    handleStDialogClose() {
      this.isStEdit = false;
      this.formStData = {
        attr_id: "",
        attr_name: "",
        attr_sel: "only",
        attr_vals: ""
      };
    },
    // 删除静态参数
    handleStDelete(stId) {
      // 请求路径：categories/:id/attributes/:attrid
      // 请求方法：delete
      this.$confirm("此操作将永久删除该信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http
            .delete(
              `categories/${this.selectOptionsValues[2]}/attributes/${stId}`
            )
            .then(res => {
              if (res.data.meta.status === 200) {
                // 刷新静态参数
                this.loadStParamsData();
                this.$message.success("删除成功");
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>

<style scoped>
.alert {
  margin-bottom: 20px;
}

.tabs {
  margin-top: 20px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
