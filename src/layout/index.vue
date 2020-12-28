<template>
    <div class="app-main">
        <div class="view-list">
            <div class="layout-logo">
                <a href="https://threejs.org">three.js</a>
            </div>
            <search :search="search" @changeSearch="setSearch"></search>
            <div class="layout-list">
                <div class="layout-list-item" v-for="item in list" :key="item.title" @click="title=item.title" :class="title==item.title ? 'chose-list' : ''">
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
                <!-- <router-link to="/foo">Go to Foo</router-link> -->
            </transition>
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
            title: ''
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
        }
    }
}
</script>

<style scoped>
.app-main {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
}
.view-container {
    width: calc(100% - 280px);
    background: grey;
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
.layout-logo a {
    text-decoration: none;
    color: #049ef4;
}
.layout-list {
    width: 280px;
    height: calc(100vh - 97px);
    overflow-y: auto;
}
.layout-list-item {
    width: 250px;
    height: 180px;
    margin-left: 15px;
    margin-top: 15px;
    border-radius: 3px;
}
.list-item-img {
    width: 250px;
    height: 140px;
}
.list-item-img img {
    width: 250px;
    height: 140px;
}
.list-item-title {
    box-sizing: border-box;
    width: 250px;
    height: 40px;
    line-height: 40px;
    padding-left: 15px;
    font-size: 16px;
    background: #F7F7F7;
}
.list-router {
    text-decoration: none;
    color: #000;
}
.chose-list {
    border: 3px solid #049EF4;
}
</style>
