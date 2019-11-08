project_name: "viz-packed_bubble-marketplace"

constant: VIS_LABEL {
  value: "Packed Bubble"
  export: override_optional
}

constant: VIS_ID {
  value: "packed_bubble-marketplace"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  url: "https://looker-custom-viz-a.lookercdn.com/master/bubble_chart.js"
  label: "@{VIS_LABEL}"
}

