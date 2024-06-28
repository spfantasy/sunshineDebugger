<script setup>
import {computed, inject, ref} from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import Icon from './VueFlowIcon.vue'
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import '@vue-flow/node-resizer/dist/style.css';
import {Drawer, Message} from "view-ui-plus";
import DynamicContent from "@/components/DynamicContent.vue";
import JSON5 from 'json5';
import VueFlowInputNode from "@/components/VueFlowInputNode.vue";
const { onInit, onNodeDragStop, addNodes, addEdges, removeNodes, removeEdges, setViewport, toObject } = useVueFlow()

const nodes = ref([]);
const edges = ref([]);
const targetEnv = inject("targetEnv");
const openDetail = ref(false);
const drawerData = ref({"attrs":{}, "contents":[]});
const ctx = ref({});
const query = ref({});
const env = inject("env");
// const dark = ref(false)

/**
 * This is a Vue Flow event-hook which can be listened to from anywhere you call the composable, instead of only on the main component
 * Any event that is available as `@event-name` on the VueFlow component is also available as `onEventName` on the composable and vice versa
 *
 * onInit is called when the VueFlow viewport is initialized
 */
onInit((vueFlowInstance) => {
  // instance is the same as the return of `useVueFlow`
  vueFlowInstance.fitView()
})

/**
 * onNodeDragStop is called when a node is done being dragged
 *
 * Node drag events provide you with:
 * 1. the event object
 * 2. the nodes array (if multiple nodes are dragged)
 * 3. the node that initiated the drag
 * 4. any intersections with other nodes
 */
onNodeDragStop(({ event, nodes, node }) => {
  console.log('Node Drag Stop', { event, nodes, node })
})


/**
 * To update a node or multiple nodes, you can
 * 1. Mutate the node objects *if* you're using `v-model`
 * 2. Use the `updateNode` method (from `useVueFlow`) to update the node(s)
 * 3. Create a new array of nodes and pass it to the `nodes` ref
 */
function updatePos() {
  nodes.value = nodes.value.map((node) => {
    return {
      ...node,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    }
  })
}

/**
 * toObject transforms your current graph data to an easily persist-able object
 */
async function renderFlow() {
  try {
    nodes.value.forEach(node => {
      if (node.data.locked === true) {
        query.value[node.id] = node.data.selection;
      }
    })
    console.log("render flow query="+JSON5.stringify(query.value));
    removeNodes(nodes.value);
    removeEdges(edges.value);
    ctx.value = await window.electron.fetchData("renderFlow", {"env": targetEnv.value.value, "query": JSON5.stringify(query.value)});
    addNodes(ctx.value.nodes);
    addEdges(ctx.value.edges);
    query.value = {};
  } catch (error) {
    console.error(error.message);
    Message.error(error.message);
  }
}

function logToObject() {
  console.log(toObject())
}

/**
 * Resets the current viewport transformation (zoom & pan)
 */
function resetTransform() {
  setViewport({ x: 0, y: 0, zoom: 1 })
}

</script>

<template>
  <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      class="biz-flow"
      :default-viewport="{ zoom: 1.5 }"
      :min-zoom="0.2"
      :max-zoom="4"
      fit-view-on-init
  >
    <Background pattern-color="#aaa" :gap="16" />

    <MiniMap />
    <template #node-input="props">
      <VueFlowInputNode :id="props.id" :data="props.data"/>
    </template>
    <Controls position="top-left">
      <ControlButton title="Reset Transform" @click="resetTransform">
        <Icon name="reset" />
      </ControlButton>

      <ControlButton title="Shuffle Node Positions" @click="updatePos">
        <Icon name="update" />
      </ControlButton>

      <ControlButton title="Log `toObject`" @click="renderFlow">
        <Icon name="log" />
      </ControlButton>
      <ControlButton title="DEBUG" @click="logToObject">
        <Icon name="log" />
      </ControlButton>
    </Controls>
  </VueFlow>
  <Drawer :closable="false" width="640" v-model="openDetail">
    <DynamicContent :json="drawerData"></DynamicContent>
  </Drawer>
</template>
<style>
/* 小地图 */
.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}
/* 连接点 */
.vue-flow__handle {
  height:10px;
  width:24px;
  background:#aaa;
  border-radius:4px
}
/* node */
.vue-flow__node {
  background-color:#f3f4f6
}
/* 输入类node */
.vue-flow__node-input {
  gap:8px;
  padding: 20px 5px;
  border-radius:8px;
  box-shadow:0 0 10px #0003
}

.vue-flow__node-input.selected {
  box-shadow:0 0 0 2px !important;
}


</style>