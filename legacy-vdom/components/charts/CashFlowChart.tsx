import { FunctionalComponent, h } from "preact";
import { useMemo } from "preact/hooks";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import { ojChart } from "ojs/ojchart";
import "ojs/ojchart";

type CashFlowItem = {
  id: string;
  month: string;
  series: "Income" | "Spending";
  value: number;
};

const CASH_FLOW_DATA: CashFlowItem[] = [
  { id: "income-feb", month: "Feb", series: "Income", value: 86000 },
  { id: "spend-feb", month: "Feb", series: "Spending", value: 45500 },
  { id: "income-mar", month: "Mar", series: "Income", value: 91000 },
  { id: "spend-mar", month: "Mar", series: "Spending", value: 52200 },
  { id: "income-apr", month: "Apr", series: "Income", value: 88000 },
  { id: "spend-apr", month: "Apr", series: "Spending", value: 47100 },
  { id: "income-may", month: "May", series: "Income", value: 96500 },
  { id: "spend-may", month: "May", series: "Spending", value: 56900 },
  { id: "income-jun", month: "Jun", series: "Income", value: 96300 },
  { id: "spend-jun", month: "Jun", series: "Spending", value: 49300 },
  { id: "income-jul", month: "Jul", series: "Income", value: 104500 },
  { id: "spend-jul", month: "Jul", series: "Spending", value: 48730 }
];

export const CashFlowChart: FunctionalComponent = () => {
  const dataProvider = useMemo(
    () =>
      new ArrayDataProvider<string, CashFlowItem>(CASH_FLOW_DATA, {
        keyAttributes: "id"
      }),
    []
  );

  const renderItem = (
    context: ojChart.ItemTemplateContext<string, CashFlowItem>
  ) => (
    <oj-chart-item
      value={context.data.value}
      groupId={[context.data.month]}
      seriesId={context.data.series}
      shortDesc={`${context.data.series}, ${context.data.month}: ₹${context.data.value.toLocaleString("en-IN")}`}
    />
  );

  return (
    <oj-chart
      class="banking-chart"
      data={dataProvider}
      type="line"
      animationOnDisplay="auto"
      animationOnDataChange="auto"
      hoverBehavior="dim"
      legend={{ position: "bottom" }}
      yAxis={{ tickLabel: { scaling: "thousand" } }}
    >
      <template slot="itemTemplate" render={renderItem} />
    </oj-chart>
  );
};
