import { createApp } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faGlobeAfrica, faMap, faPlay, faStop, faStepBackward, faStepForward
} from '@fortawesome/free-solid-svg-icons';
import MmLabel from './components/Label.vue'
import App from './App.vue';
import './index.css';

library.add(faGlobeAfrica, faMap, faPlay, faStop, faStepBackward, faStepForward);

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);
app.component('mm-label', MmLabel);

app.config.globalProperties.$filters = {
  massKg(mass) {
    if (isNaN(mass)) {
      return 'unknown';
    }
    return `${(mass / 1000).toLocaleString()} kg`;
  }
}

app.mount('#app');
