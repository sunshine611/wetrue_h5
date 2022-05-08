import Vue from 'vue'
import mixinsMobile from './mixinsMobile'
import mixinsUtils from './mixinsUtils'
import mixinsPopup from './mixinsPopup'

const Plugins = [mixinsMobile, mixinsUtils, mixinsPopup]
Plugins.map((plugin) => {
    Vue.use(plugin)
})
export default Vue
