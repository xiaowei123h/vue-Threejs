<template>
    <div>
        <div class="app-main" v-if="!innerWidth">
            <div class="view-list">
                <div class="layout-logo">
                    <a href="https://threejs.org">three.js</a>
                </div>
                <search :search="search" @changeSearch="setSearch"></search>
                <div class="layout-list">
                    <div class="layout-list-item" v-for="(item, index) in list" :key="item.title" @click="title=item.title" :class="title==item.title ? 'chose-list' : ''" :style="{marginBottom: index==(list.length-1) ? '30px' : '0'}">
                        <router-link :to="item.path" class="list-router">
                            <div class="list-item-img">
                                <img :src="item.icon">
                            </div>
                            <div class="list-item-title">
                                {{ item.title }}
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>
            <div class="view-container">
                <transition name="fade-transform" mode="out-in">
                    <router-view :key="key" />
                </transition>
            </div>
        </div>
        <div class="mini-app-main" v-if="innerWidth">
            <div class="mini-main-nav">
                <div class="layout-logo">
                    <a href="https://threejs.org">three.js</a>
                </div>
                <div class="layout-icon" @click="drawer=true">
                    <i class="el-icon-s-fold"></i>
                </div>
            </div>
            <div class="view-container">
                <transition name="fade-transform" mode="out-in">
                    <router-view :key="key" />
                </transition>
            </div>

            <el-drawer
                title=""
                :visible.sync="drawer"
                direction="rtl"
                :with-header="false"
                class="mini-app-drawer">
                <search :search="search" @changeSearch="setSearch"></search>
                <div class="layout-list">
                    <div class="layout-list-item" v-for="(item, index) in list" :key="item.title" @click="title=item.title" :class="title==item.title ? 'chose-list' : ''" :style="{marginBottom: index==(list.length-1) ? '30px' : '0'}">
                        <router-link :to="item.path" class="list-router">
                            <div class="list-item-img">
                                <img :src="item.icon">
                            </div>
                            <div class="list-item-title">
                                {{ item.title }}
                            </div>
                        </router-link>
                    </div>
                </div>
            </el-drawer>
        </div>
    </div>
</template>

<script>
import { Search } from './components'
export default {
    components: {
        Search
    },
    computed: {
        key() {
            return this.$route.path
        }
    },
    data() {
        return {
            search: '',
            list: [],
            title: '',
            drawer: false,
            innerWidth: false
        }
    },
    watch: {
        search(newSearch, oldSearch) {
            if (oldSearch != newSearch) {
                if (this.search == '') {
                    this.getBreadcrumb()
                } else {
                    this.handleSearch()
                }
            }
        }
    },
    mounted() {
        this.getInnerWidth()
        window.addEventListener('resize', this.getInnerWidth, false)
    },
    created() {
        this.getBreadcrumb()
    },
    methods: {
        handleSearch() {
            this.getBreadcrumb()
            var searchList = []
            for(var i = 0; i < this.list.length; i++) {
                if (this.list[i].title.indexOf(this.search) >= 0 && this.search != "") {
                    searchList.push(this.list[i])
                }
            }
            this.list = searchList
        },
        setSearch(search) {
            this.search = search
        },
        getBreadcrumb() {
            this.list = []
            for (var i = 0, len = this.$router.options.routes[0].children.length; i < len; i++) {
                this.list.push({
                    title: this.$router.options.routes[0].children[i].meta.title,
                    icon: require('@/assets/screenshots/' + this.$router.options.routes[0].children[i].meta.icon + '.jpg'),
                    path: this.$router.options.routes[0].children[i].path
                })
            }
        },
        getInnerWidth() {
            if (window.innerWidth >= 640) {
                this.innerWidth = false
            } else {
                this.innerWidth = true
            }
        }
    }
}
</script>

<style scoped>
@media screen and (min-width: 640px) {
    .app-main {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
    }
    .mini-app-main {
        display: none;
    }
    .view-container {
        width: calc(100% - 280px);
        height: 100vh;
        overflow: hidden;
    }
    .view-list {
        width: 280px;
    }
    .layout-logo {
        width: 100%;
        height: 47px;
        line-height: 47px;
        font-size: 18px;
        font-weight: bold;
        padding-left: 15px;
        letter-spacing: 1.5px;
        border-bottom: 1px solid #E8E8E8;
    }
    .layout-list {
        width: 280px;
        height: calc(100vh - 97px);
        overflow-y: auto;
    }
}
@media screen and (max-width:640px) {
    .mini-app-main {
        display: block;
        width: 100%;
    }
    .app-main {
        display: none;
    }
    .mini-main-nav {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 47px;
        line-height: 47px;
        border-bottom: 1px solid #E8E8E8;
    }
    .view-container {
        width: 100%;
        height: calc(100vh - 48px);
        overflow: hidden;
    }
    .layout-logo {
        height: 47px;
        line-height: 47px;
        font-size: 18px;
        font-weight: bold;
        padding-left: 15px;
        letter-spacing: 1.5px;
    }
    .layout-icon {
        height: 47px;
        line-height: 47px;
        font-size: 24px;
        font-weight: bold;
        padding-right: 15px;
        cursor: pointer;
    }
    .layout-list {
        width: 280px;
        height: calc(100vh - 50px);
        overflow-y: auto;
    }
}
.layout-logo a {
    text-decoration: none;
    color: #049ef4;
}
.layout-list-item {
    width: 240px;
    height: 180px;
    margin-left: 15px;
    margin-top: 15px;
    border-radius: 3px;
}
.list-item-img {
    width: 240px;
    height: 140px;
}
.list-item-img img {
    width: 240px;
    height: 140px;
}
.list-item-title {
    box-sizing: border-box;
    width: 240px;
    height: 40px;
    line-height: 40px;
    padding-left: 15px;
    font-size: 16px;
    background: #F7F7F7;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.list-router {
    text-decoration: none;
    color: #000;
}
.chose-list {
    box-shadow: 0 0 0 3px #049EF4;
}
</style>

<style>
@media screen and (max-width: 640px) {
    .mini-app-drawer .el-drawer__open .el-drawer.rtl {
        width: 280px !important;
    }
    .el-drawer {
        outline: none;
    }
}
</style>
