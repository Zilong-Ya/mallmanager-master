<template>
<el-card shadow="always" class="goods-card">
    <!-- 面包屑 -->
    <com-breadcrumb levelName1="数据统计" levelName2="数据报表"></com-breadcrumb>
    <!-- 图形 -->
    <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
    <div id="main" style="width: 800px;height:400px;"></div>
</el-card>
</template>

<script>
// var echarts = require('echarts')
export default {
    data() {
        return {

        }
    },
    async mounted() {
        var echarts = require('echarts')
        // 生成图形
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'))

        // 指定图表的配置项和数据
        var option1 = {
            title: {
                text: '区域销售情况统计'
            },
            tooltip: {
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
        }
        // 发送请求获取数据
        var res = await this.$http.get(`reports/type/1`)
        var option2 = res.data.data
        // 对象合并
        var option = {
            ...option1,
            ...option2
        }
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option)
    },
}
</script>

<style scoped>

</style>
