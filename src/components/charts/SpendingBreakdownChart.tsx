import { FunctionalComponent, h } from "preact";
import { useMemo } from "preact/hooks";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import { ojChart } from "ojs/ojchart";
import "ojs/ojchart";

type SpendingItem = {
  id: string;
  category: string;
  value: number;
};

const SPENDING_DATA: SpendingItem[] = [
  { id: "housing", category: "Housing", value: 16750 },
  { id: "shopping", category: "Shopping", value: 10820 },
  { id: "food", category: "Food", value: 8460 },
  { id: "transport", category: "Transport", value: 6290 },
  { id: "other", category: "Other", value: 6410 }
];

export const SpendingBreakdownChart: FunctionalComponent = () => {
  const dataProvider = useMemo(
    () =>
      new ArrayDataProvider<string, SpendingItem>(SPENDING_DATA, {
        keyAttributes: "id"
      }),
    []
  );

  const renderItem = (
    context: ojChart.ItemTemplateContext<string, SpendingItem>
  ) => (
    <oj-chart-item
      value={context.data.value}
      groupId={["July"]}
      seriesId={context.data.category}
      shortDesc={`${context.data.category}: ₹${context.data.value.toLocaleString("en-IN")}`}
    />
  );

  return (
    <oj-chart
      class="banking-chart"
      data={dataProvider}
      type="pie"
      animationOnDisplay="auto"
      animationOnDataChange="auto"
      hoverBehavior="dim"
      legend={{ position: "bottom" }}
      pieCenter={{ label: "₹48.7K" }}
    >
      <template slot="itemTemplate" render={renderItem} />
    </oj-chart>
  );
};