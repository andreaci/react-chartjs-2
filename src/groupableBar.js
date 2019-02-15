import React from "react";
import ChartComponent, { Chart } from "./index";

Chart.defaults.groupableBar = Chart.helpers.clone(Chart.defaults.bar);

Chart.controllers.groupableBar = Chart.controllers.bar.extend({
  // position the bars based on the stack index
  calculateBarX: function(index, datasetIndex) {
    var stackIndex = this.getMeta().stackIndex;
    return Chart.controllers.bar.prototype.calculateBarX.apply(this, [
      index,
      stackIndex
    ]);
  },

  hideOtherStacks: function(datasetIndex) {
    var meta = this.getMeta();
    var stackIndex = meta.stackIndex;

    this.hiddens = [];
    for (var i = 0; i < datasetIndex; i++) {
      var dsMeta = this.chart.getDatasetMeta(i);
      if (dsMeta.stackIndex !== stackIndex) {
        this.hiddens.push(dsMeta.hidden);
        dsMeta.hidden = true;
      }
    }
  },

  unhideOtherStacks: function(datasetIndex) {
    var meta = this.getMeta();
    var stackIndex = meta.stackIndex;

    for (var i = 0; i < datasetIndex; i++) {
      var dsMeta = this.chart.getDatasetMeta(i);
      if (dsMeta.stackIndex !== stackIndex) {
        dsMeta.hidden = this.hiddens.unshift();
      }
    }
  },

  calculateBarY: function(index, datasetIndex) {
    this.hideOtherStacks(datasetIndex);
    var barY = Chart.controllers.bar.prototype.calculateBarY.apply(this, [
      index,
      datasetIndex
    ]);
    this.unhideOtherStacks(datasetIndex);
    return barY;
  },

  calculateBarBase: function(datasetIndex, index) {
    this.hideOtherStacks(datasetIndex);
    var barBase = Chart.controllers.bar.prototype.calculateBarBase.apply(this, [
      datasetIndex,
      index
    ]);
    this.unhideOtherStacks(datasetIndex);
    return barBase;
  },

  getBarCount: function() {
    var stacks = [];

    // put the stack index in the dataset meta
    Chart.helpers.each(
      this.chart.data.datasets,
      function(dataset, datasetIndex) {
        var meta = this.chart.getDatasetMeta(datasetIndex);
        if (meta.bar && this.chart.isDatasetVisible(datasetIndex)) {
          var stackIndex = stacks.indexOf(dataset.stack);
          if (stackIndex === -1) {
            stackIndex = stacks.length;
            stacks.push(dataset.stack);
          }
          meta.stackIndex = stackIndex;
        }
      },
      this
    );

    this.getMeta().stacks = stacks;
    return stacks.length;
  }
});

export class GroupableBar extends React.Component {
  render() {
    return (
      <ChartComponent
        {...this.props}
        ref={ref => (this.chartInstance = ref && ref.chartInstance)}
        type="groupableBar"
      />
    );
  }
}
