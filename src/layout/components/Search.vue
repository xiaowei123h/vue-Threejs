<template>
    <div class="layout-search">
        <el-input v-model="compSearch" @blur="searchBlur" @input="changeSearch" @focus="searchFocus">
            <i slot="prefix" class="el-input__icon el-icon-search input-icon" v-if="!isSearch"></i>
            <i slot="suffix" class="el-input__icon el-icon-close input-icon" v-if="isSearch" @click="closeSearch"></i>
        </el-input>
    </div>
</template>

<script>
export default {
    props: {
        search: {
            type: String
        }
    },
    data() {
        return {
            compSearch: '',
            isSearch: false
        }
    },
    methods: {
        changeSearch(e) {
            this.$emit('changeSearch', this.compSearch)
        },
        searchBlur() {
            if (this.compSearch == '') {
                this.isSearch = false
            }
        },
        searchFocus() {
            this.isSearch = true
        },
        closeSearch() {
            this.compSearch = ''
            this.$emit('changeSearch', '')
            this.isSearch = false
        }
    }
}
</script>

<style scoped>
.layout-search {
    width: 100%;
    height: 48px;
    border-bottom: 1px solid #E8E8E8;
}
.input-icon {
    font-size: 18px;
    color: #999;
}
.el-icon-search {
    padding-left: 10px;
}
.el-icon-close {
    cursor: pointer;
}
</style>

<style>
.layout-search .el-input__inner {
    height: 48px;
    outline: none;
    border: none;
}
.layout-search .el-input__suffix {
    right: 10px;
}
</style>
