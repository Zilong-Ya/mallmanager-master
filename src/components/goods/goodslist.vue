<template>
<el-card shadow="always" class="goods-card">
  <!-- 面包屑 -->
  <com-breadcrumb levelName1="商品管理" levelName2="商品列表"></com-breadcrumb>

  <!-- 搜索框 -->
  <el-row class="search">
    <el-col :span="8">
      <el-input placeholder="请输入内容" v-model="search" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="handleSearch()"></el-button>
      </el-input>
    </el-col>
    <el-col :span="4">
      <el-button type="success" plain class="addBtn" @click="$router.push({name:'goodsadd'})">添加商品</el-button>
    </el-col>
  </el-row>

  <!-- 数据列表 -->
  <el-table :data="goods" v-loading="loading" border style="width: 100%" height="500px">
    <el-table-column type="index" width="50" label="#"></el-table-column>
    <el-table-column prop="goods_name" label="商品名称"></el-table-column>
    <el-table-column prop="goods_price" label="商品价格（元）" width="120"></el-table-column>
    <el-table-column prop="goods_weight" label="商品重量" width="100"></el-table-column>
    <el-table-column label="创建日期" width="100">
      <template slot-scope="scope">{{scope.row.add_time | fmtDate('YYYY-MM-DD')}}</template>
    </el-table-column>
    <el-table-column label="操作" width="100">
      <template slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" plain circle size="mini" @click="$router.push({path:`/goodsedit/${scope.row.goods_id}`})"></el-button>
        <el-button type="danger" icon="el-icon-delete" plain circle size="mini" @click="handleDelete(scope.row.goods_id)"></el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页 -->
  <!-- 事件：size-change： 页码改变时会触发 -->
  <!-- 事件：current-change：当前页改变时会触发 -->
  <!-- 属性 current-page 指定当前页 -->
  <el-pagination class="pagging" 
   @size-change="handleSizeChange"
   @current-change="handleCurrentChange" 
   :current-page="pagenum" 
   :page-sizes="[10, 20, 30, 40]" 
   :page-size="pagesize" 
   layout="total, sizes, prev, pager, next, jumper" 
   :total="total"></el-pagination>

</el-card>
</template>

<script>
export default {
  data() {
    return {
      goods: [], // 商品列表
      loading: true,
      search: "",
      pagenum: 1, // 页码
      pagesize: 10, // 页面条数
      total: -1, // 总条数

    }
  },
  created() {
    // 页面创建加载数据
    this.loadData();
  },
  methods: {
    // 同步加载数据
    async loadData() {
      this.loading = true;
      const res = await this.$http.get(
        `goods?query=${this.search}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
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
        this.goods = data.goods;
        // 分页总条数
        this.total = data.total;
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
    handleDelete(id) {
      // 用户删除
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$http
            .delete(`goods/${id}`)
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
