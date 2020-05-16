<template>
<el-card shadow="always">
  <!-- 1.面包屑 -->
  <com-breadcrumb levelName1="商品管理" levelName2="添加商品"></com-breadcrumb>

  <!-- 2.提示组件 -->
  <el-alert title="添加商品信息" type="success" center show-icon></el-alert>

  <!-- 3.步骤条  控制步骤 active -->
  <el-steps :active="active*1" align-center class="steps" finish-status="success">
    <el-step title="基本信息"></el-step>
    <el-step title="商品参数"></el-step>
    <el-step title="商品属性"></el-step>
    <el-step title="商品图片"></el-step>
    <el-step title="商品内容"></el-step>
  </el-steps>

  <!-- 4.标签页 控制步骤 name -->
  <el-form :model="formdata" label-position="top">
    <el-tabs v-model="active" tab-position="left" @tab-click="handleTagsChange" :before-leave="handleTagOpen">
      <el-tab-pane label="基本信息" name="1">
        <el-form-item label="商品名称">
          <el-input v-model="formdata.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input v-model="formdata.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量">
          <el-input v-model="formdata.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品数量">
          <el-input v-model="formdata.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader :options="options" clearable :props="defaultProps" v-model="selectOptionsValues"></el-cascader>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品参数" name="2">
        <!-- 动态参数 -> 内容跟随分类变化而变化 -->
        <el-form-item :label="param.attr_name" v-for="(param, index) in arrgDyParams" :key="index">
          <!-- 复选框 -->
          <el-checkbox v-model="param.attr_vals" :label="val" border v-for="(val, index) in param.attr_vals" :key="index"></el-checkbox>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品属性" name="3">
        <!-- 静态参数 -> 具体分类参数对应的表单值一致 -->
        <el-form-item :label="param.attr_name" v-for="(param, index) in arrgStaticsParams" :key="index">
          <el-input v-model="param.attr_vals"></el-input>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品图片" name="4">
        <el-form-item label="请选择上传的图片">
          <!-- action 上传的路径 不是axios baseURL无效 -->
          <el-upload 
          action="http://localhost:8888/api/private/v1/upload" 
          :headers="headers"
          :before-upload="beforeAvatarUpload"
          list-type="picture-card" 
          :on-preview="handlePicturePreview" 
          :on-success="handlePictureSuccess" 
          :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品内容" name="5">
         <el-form-item label="商品内容">
           <quill-editor v-model="formdata.goods_introduce"></quill-editor>
        </el-form-item>
         <el-button type="primary" @click="handleAddGoods()">添加商品</el-button>
      </el-tab-pane>
    </el-tabs>
  </el-form>
</el-card>
</template>

<script>
// 局部使用富文本标签
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'

export default {
  // 注册组件
  components: {
    quillEditor
  },
  data() {
    return {
      active: "1",
      formdata: {
        goods_name:'',
        goods_cat:'',
        goods_price:'',
        goods_number:'',
        goods_weight:'',
        goods_introduce:'',
        pics:[],
        attrs:[],
      }, // 添加表单
      options: [], // 分类列表
      defaultProps: { // 级联列表默认属性
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectOptionsValues: [1, 3, 6], // 绑定选中值
      arrgDyParams: [], // 动态参数
      arrgStaticsParams: [], // 静态参数
      dialogImageUrl: '',  // 上传后显示图片的地址
      dialogVisible: false,  // 控制图片显示
      headers:{ // 设置上传请求头
        Authorization: localStorage.getItem("token")
      },

    };
  },
  created() {
    this.loadDataCategory()
  },
  methods: {
    /**
     * 加载三级分类
     */
    async loadDataCategory() {
      const res = await this.$http.get(`categories?type=3`)
      this.options = res.data.data
    },
    /**
     * 当标签页被选中时，触发
     */
    async handleTagsChange(tab) {
      if (tab.name === '2') { // 商品参数被选中
        // 根据分类ID发送请求得到 商品的动态参数
        const res = await this.$http.get(`categories/${this.selectOptionsValues[2]}/attributes?sel=many`)
        console.log(res)
        this.arrgDyParams = res.data.data
        // 处理attr_vals 以，分割成数组
        if (this.arrgDyParams != null) {
          this.arrgDyParams.forEach(param => {
            if (param.attr_vals.trim() != '')
              param.attr_vals = param.attr_vals.trim().split(',')
          })
        }
      } else if (tab.name === '3') { // 商品属性被选中 
        // 根据分类ID发送请求得到 商品的静态参数
        const res = await this.$http.get(`categories/${this.selectOptionsValues[2]}/attributes?sel=only`)
        console.log(res)
        this.arrgStaticsParams = res.data.data
      }
    },
    handleTagOpen() { // 如果没有选择商品分类 那么阻止标签打开
      if (this.active !== 1 && this.selectOptionsValues.length !== 3) {
        this.$message.warning('请先选择分类信息')
        return false // 标签页不跳转
      }
    },
    handlePicturePreview(file){  // 点击文件列表中已上传的文件时的钩子
         // 显示缩略图
        this.dialogImageUrl = file.url
        this.dialogVisible = true
    },
    handlePictureSuccess(file){ // 文件上传成功时的钩子
       // 封装表单 添加图片
       this.formdata.pics.push({'pic':file.data.tmp_path})
    },
    handleRemove(file){ // 文件列表移除文件时的钩子
      // 从表单中移除图片对象
      this.formdata.pics.map((item,index)=>{
          if(item.pic === file.response.data.tmp_path){
            // 删除该元素 splice(位置，个数)
            this.formdata.pics.splice(index,1)
          }
      })
    },
    beforeAvatarUpload(file){  // 上传前的格式约束 (类型和大小)
        const isType = file.type === 'image/jpeg' || file.type === 'image/png'
        const isLt2M = file.size / 1024 / 1024 < 2
        // const isLt2M = file.size < 500990
        if (!isType) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isType && isLt2M;
    },
    async handleAddGoods(){ // 添加商品
      // goods_name	商品名称	不能为空
      // goods_cat	以为','分割的分类列表	不能为空 (需要处理)
      this.formdata.goods_cat = this.selectOptionsValues.join(',')
      // goods_price	价格	不能为空
      // goods_number	数量	不能为空
      // goods_weight	重量	不能为空
      // goods_introduce	介绍	可以为空
      // pics	上传的图片临时路径（对象）	可以为空  (需要处理)
      // attrs	商品的参数（数组）	可以为空  (需要处理)
      // attrs = 动态参数 + 静态参数
      let arr1 = this.arrgDyParams.map(item=>{
        return {'attr_id':item.attr_id,'attr_vals':item.attr_vals.join(',')}
      })
      let arr2 = this.arrgStaticsParams.map(item=>{
        return {'attr_id':item.attr_id,'attr_vals':item.attr_vals}
      })
      this.formdata.attrs = [...arr1,...arr2]

      let res = await this.$http.post('goods',this.formdata)
      let {meta:{msg,status}} = res.data
      if(status  === 201){
        this.$message.success(msg)
        // 跳转到商品列表
        this.$router.push({name:'goods'})
      }else{
        this.$message.error(msg)
      }
    }
  }
};
</script>

<style scoped>
.steps {
  margin: 20px 0;
}
.el-button{
  margin: 10px 100px;
}
</style>
