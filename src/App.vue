<template>
  <div class="flex py-2 mb-4 border-double border-b-4">
    <div class="mr-3 text-gray-600 text-center uppercase border-r-2 px-2 font-bold pt-1">
      <h1 class="">Meteorite</h1>
      <h1 class="uppercase tracking-widest">Map</h1>
    </div>
    <div class="mr-4">
      <mm-label text="Playback">
        <button
          class="text-xs px-1.5 py-1 m-0.5 border rounded-lg border-gray-400 hover:bg-gray-200 hover:border-gray-500 hover:shadow disabled:opacity-50"
          :disabled="state.landingIndex === 0"
          @click="goToBeginning"
        >
          <font-awesome-icon icon="step-backward" />
        </button>
        <button
          class="text-xs px-1.5 py-1 m-0.5 border rounded-lg border-gray-400 hover:bg-gray-200 hover:border-gray-500 hover:shadow"
          @click="startStop"
        >
          <font-awesome-icon v-show="state.running" icon="stop" />
          <font-awesome-icon v-show="!state.running" icon="play" />
        </button>
        <button
          :disabled="state.landingIndex === meteoriteLandings.length - 1"
          class="text-xs px-1.5 py-1 m-0.5 border rounded-lg border-gray-400 hover:bg-gray-200 hover:border-gray-500 hover:shadow disabled:opacity-50"
          @click="goToEnd"
        >
          <font-awesome-icon icon="step-forward" />
        </button>
      </mm-label>
    </div>
    <div class="mr-8">
      <mm-label text="Timeline">
        <input
          class="border-none"
          type="range"
          :min="years.min"
          :max="years.max"
          :value="currentYear"
          v-on:change="sliderChanged"
        />
      </mm-label>
      <div class="flex text-gray-500 text-xs -mt-2 font-thin">
        <div class="mr-auto">{{ years.min }}</div>
        <div class="ml-auto">{{ years.max }}</div>
      </div>
    </div>
    <div class="mr-6">
      <mm-label text="Landings shown through year">
        <div class="text-lg font-bold tracking-wide">
          {{ currentYear }}
        </div>
      </mm-label>
    </div>
    <div class="mr-4">
      <mm-label text="Map Projection">
        <button
          class="text-sm px-1.5 py-1 m-0.5 border rounded-lg border-gray-400 hover:bg-gray-200 hover:border-gray-500 hover:shadow"
          :class="{ active: state.projection === 'geoEquirectangular' }"
          @click="setProjection('geoEquirectangular')"
          title="Equirectangular map projection"
        >
          <font-awesome-icon icon="map" />
        </button>
        <button
          class="text-sm px-1.5 py-1 m-0.5 border rounded-lg border-gray-400 hover:bg-gray-200 hover:border-gray-500 hover:shadow"
          :class="{ active: state.projection === 'geoOrthographic' }"
          @click="setProjection('geoOrthographic')"
          title="Orthrographic map projection"
        >
          <font-awesome-icon icon="globe-africa" />
        </button>
      </mm-label>
    </div>
    <div class="ml-auto mr-2 text-right text-sm">
      <a class="p-1 hover:underline block" href="https://github.com/fotijr/meteorite-map">GitHub</a>
      <a class="p-1 hover:underline block" href="https://fotijr.com">fotijr.com</a>
    </div>
  </div>
  <svg
    ref="svg"
    class="w-full h-full"
    viewBox="200 20 600 600"
    preserveAspectRatio="xMidYMid meet"
  ></svg>
  <div
    class="tooltip pointer-events-none opacity-0"
    ref="tooltip"
    :style="{ top: tooltip.coordinates.y, left: tooltip.coordinates.x }"
  >
    <LandingTooltip :landing="tooltip.landing" />
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { ExtendedFeatureCollection } from 'd3';
import { defineComponent } from 'vue';
import { MeteoriteLanding } from './models/meteorites';
import { getMeteoriteLandings } from './services/meteorite.service';
import LandingTooltip from './components/LandingTooltip.vue';
import Label from './components/Label.vue';

export default defineComponent({
  name: 'App',
  components: {
    LandingTooltip,
    Label,
  },
  data() {
    return {
      meteoriteLandings: [] as MeteoriteLanding[],
      meteorTimer: 0,
      launched: false,
      tooltip: {
        show: false,
        landing: (null as unknown) as MeteoriteLanding,
        coordinates: { x: '0', y: '0' },
      },
      // projection: d3.geoProjection,
      svg: (undefined as unknown) as d3.Selection<
        SVGGElement,
        unknown,
        HTMLElement,
        any
      >,
      path: (undefined as unknown) as d3.GeoPath<any, d3.GeoPermissibleObjects>,
      projection: (undefined as unknown) as d3.GeoProjection,
      size: {
        width: 0,
        height: 0,
      },
      /** Animation state */
      state: {
        running: false,
        /** Map projection name. */
        projection: 'geoEquirectangular' as
          | 'geoEquirectangular'
          | 'geoOrthographic',
        /** Current index of a landing to render */
        landingIndex: -1,
        drawnLandings: [] as MeteoriteLanding[],
      },
      currentYear: 0,
      years: {
        min: 0,
        max: 0,
      },
      $refs: {
        svg: {} as SVGElement,
        tooltip: {} as HTMLDivElement,
      },
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize() {
      var margin = { top: 0, right: 0, bottom: 0, left: 0 };

      const size = (this.$refs.svg as SVGElement).getBoundingClientRect();
      this.size.width = size.width; // screen.width - margin.left - margin.right;
      this.size.height = size.height; // screen.height - 300 - margin.top - margin.bottom;

      this.svg = d3
        .select(this.$refs.svg as SVGElement)
        .attr('width', this.size.width)
        .attr('height', this.size.height)
        .append('g')
        .attr('class', 'map');

      const results = await Promise.all([
        d3.json<ExtendedFeatureCollection>('/world_countries.json'),
        getMeteoriteLandings(),
      ]);
      // console.log('results', results);
      this.ready(null, results[0]!, results[1]);
    },
    ready(
      error: any,
      countries: ExtendedFeatureCollection,
      landings: MeteoriteLanding[]
    ) {
      // exclude landings without geolocation data
      this.meteoriteLandings = landings.filter((m) => m.geolocation);
      const years = landings.map((m) => m.year);
      this.years.min = d3.min(years)!;
      this.years.max = d3.max(years)!;
      this.currentYear = this.years.min;
      this.setProjection(this.state.projection);
      this.svg
        .append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', this.path)
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style('opacity', 0.8)
        // tooltips
        .style('stroke', 'white')
        .style('stroke-width', 0.3);

      this.svg.append('g').attr('class', 'landings');
    },
    setProjection(projectionType: 'geoEquirectangular' | 'geoOrthographic') {
      const wasPlaying = this.state.running;
      const drawnIndex = this.state.landingIndex;
      this.goToBeginning();
      this.projection = d3[projectionType]();
      this.state.projection = projectionType;

      this.path = d3.geoPath().projection(this.projection);

      this.svg
        .selectAll('path')
        .transition()
        .ease(d3.easeCubicInOut)
        .duration(300)
        .attr('d', this.path);

      this.setShownLandingsByIndex(drawnIndex);
      if (wasPlaying) {
        this.start();
      }
    },
    startStop() {
      if (!this.state.running) {
        if (this.state.landingIndex === this.meteoriteLandings.length - 1) {
          // all landings shown, so reset timeline before starting playback
          this.goToBeginning();
        }
        this.start();
      } else {
        this.stop();
      }
    },
    goToBeginning() {
      this.stop();
      this.setShownLandingsByIndex(-1);
    },
    goToEnd() {
      this.stop();
      this.setShownLandingsByIndex(this.meteoriteLandings.length - 1);
    },
    drawLandingPoints() {
      const self = this;
      const landings = this.svg
        .select('g.landings')
        .selectAll('circle.landing')
        .data(this.state.drawnLandings);
      const tooltip = d3.select(this.$refs.tooltip);
      const drawnLanding = landings
        .enter()
        .append('circle')
        .attr('class', 'landing')
        .attr('cx', (m) => {
          return this.projection(m.geolocation.coordinates)![0];
        })
        .attr('cy', (m) => {
          return this.projection(m.geolocation.coordinates)![1];
        })
        .attr('stroke', 'yellow')
        //.attr('stroke-width', '0.5px')
        .attr('r', '2px');

      if (drawnLanding.size() === 1) {
        const landing = drawnLanding.datum();
        // if only one landing, it's in regular playback mode so show ripple animation
        this.svg
          .append('circle')
          .attr('class', 'ripple')
          .attr('cx', this.projection(landing.geolocation.coordinates)![0])
          .attr('cy', this.projection(landing.geolocation.coordinates)![1])
          .attr('r', '2px')
          .attr('stroke', '#369')
          .attr('stroke-width', '2px')
          .attr('stroke-opacity', '0.9')
          .transition()
          .ease(d3.easeLinear)
          // .duration(10)
          .attr('fill', 'none')
          .attr('r', '24px')
          .attr('stroke', '#369')
          .attr('stroke-width', '0')
          .attr('stroke-opacity', '0')
          .duration(1100)
          // remove animation element when complete
          .remove();
      }

      drawnLanding
        .on('mouseover', (e: MouseEvent, m) => {
          d3.select(e.target as SVGCircleElement).classed('hovered', true);
          tooltip.transition().duration(200).style('opacity', 1);
          self.tooltip.coordinates = { x: `${e.x}px`, y: `${e.y}px` };
          self.tooltip.landing = m;
          self.tooltip.show = true;
        })
        .on('mouseout', (e: MouseEvent, m: MeteoriteLanding) => {
          d3.select(e.target as SVGCircleElement).classed('hovered', false);
          tooltip.transition().duration(200).style('opacity', 0);
          self.tooltip.show = false;
        });

      // remove landings no longer visible
      landings.exit().remove();
    },
    timerTick() {
      const landing = this.meteoriteLandings[this.state.landingIndex];
      this.currentYear = landing.year;
      this.state.drawnLandings.push(landing);
      this.currentYear = landing.year;
      this.drawLandingPoints();
      this.state.landingIndex++;
      if (this.state.landingIndex >= this.meteoriteLandings.length) {
        // timeline done
        clearInterval(this.meteorTimer);
        this.state.running = false;
        this.state.landingIndex = 0;
        this.state.drawnLandings = [];
      }
    },
    start() {
      const self = this;
      this.state.running = true;
      if (this.state.landingIndex < 0) {
        this.state.landingIndex = 0;
      }
      this.meteorTimer = window.setInterval(this.timerTick.bind(this), 100);
    },
    stop() {
      clearInterval(this.meteorTimer);
      this.state.running = false;
    },
    sliderChanged({ target }: { target: HTMLInputElement }) {
      const year = target.valueAsNumber;
      let closestIndex = 0;
      let closestLanding = this.meteoriteLandings[
        this.meteoriteLandings.length - 1
      ];
      this.meteoriteLandings.some((m, i) => {
        if (closestLanding.year < year && year < m.year) {
          // past desired year, so return previous landing
          return true;
        }
        closestLanding = m;
        closestIndex = i;
        if (m.year === year) {
          // exact year match
          return true;
        }
      });
      this.setShownLandingsByIndex(closestIndex);
    },
    /** Show landings based on array index. To show nothing, pass in -1. */
    setShownLandingsByIndex(index: number) {
      this.currentYear = this.meteoriteLandings[index]?.year || this.years.min;
      this.state.drawnLandings = this.meteoriteLandings.slice(0, index + 1);
      this.state.landingIndex = index;
      this.drawLandingPoints();
    },
  },
});
</script>

<style>
button.active {
  @apply bg-indigo-50 border-blue-900 shadow-sm;
}

div.tooltip {
  position: absolute;
  /* bottom: 0;
  right: 0; */
}

input {
  outline: 0;
}
input[type='range']::-moz-focus-outer {
  border: 0;
}

:-moz-focusring {
  outline: 0;
}

svg circle.landing {
  fill: red;
  stroke: transparent;
  stroke-width: 4px;
}

svg circle.landing.hovered {
  stroke: yellow;
}

circle.ripple {
  pointer-events: none;
}
</style>
