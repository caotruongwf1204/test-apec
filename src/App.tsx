import { useEffect, useState } from "react";
import axios from "axios";
import { Select, Space } from "antd";
import * as echarts from "echarts";

interface EventData {
  eventName: string;
  eventTime: number;
}

interface Dataset {
  label: string;
  data: number[];
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

const App = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [value, setValue] = useState<string>("All events");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<EventData[]>(
          "https://shopify.gapsoftware.asia/api/event/All?shop=lucky-birds-store.myshopify.com"
        );
        const responseData: EventData[] = response.data;

        const extractEventNames = (events: EventData[]): string[] => {
          const eventNames = new Set<string>();
          events.forEach((event) => {
            eventNames.add(event.eventName);
          });
          return Array.from(eventNames);
        };
        extractEventNames(responseData);
        const filteredEventNames =
          value === "All events"
            ? ["PageView", "ViewContent", "AddToCart", "InitiateCheckout"]
            : [value];

        const time = [
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "20:00",
          "21:00",
          "22:00",
          "23:00",
        ];

        const isInTimeRange = (
          eventTime: string,
          startTime: string,
          endTime: string
        ): boolean => {
          return eventTime >= startTime && eventTime < endTime;
        };

        const filterDataByTime = (
          responseData: EventData[],
          time: string[],
          eventName: string
        ): { time: string; count: number }[] => {
          const dataTest = time
            .map((startTime, index) => {
              const endTime = time[index + 1];

              const count = responseData.filter((e) => {
                const eventTime = new Date(
                  e.eventTime * 1000
                ).toLocaleTimeString("en-US", { hour12: false });

                return (
                  isInTimeRange(eventTime, startTime, endTime) &&
                  e.eventName === eventName
                );
              }).length;

              return { time: startTime, count: count };
            })
            .filter((item) => item.time !== undefined);

          return dataTest;
        };

        const datasets: Dataset[] = [];

        filteredEventNames.forEach((eventName) => {
          const dataChart = filterDataByTime(responseData, time, eventName);

          const dataCount = dataChart.map((item) => item.count);

          const dataset: Dataset = {
            label: eventName,
            data: dataCount,
          };
          datasets.push(dataset);
        });
        setChartData({
          labels: time,
          datasets: datasets,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [value]);

  useEffect(() => {
    if (!chartData) return;

    const chart = echarts.init(
      document.getElementById("chart") as HTMLDivElement
    );
    chart.setOption({
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: chartData.datasets.map((dataset: Dataset) => dataset.label),
      },  
      responsive: true,
      resizeDelay: 200,
    
      resizeDebounce: 50,
    
      xAxis: {
        type: "category",
        data: chartData.labels,
      },
      yAxis: {
        type: "value",
      },
      series: chartData.datasets.map((dataset: Dataset) => ({
        name: dataset.label,
        type: "line",

        data: dataset.data,
      })),
    });

    return () => {
      chart.dispose();
    };
  }, [chartData]);

  const handleChange = (value: string) => {
    setValue(value);
  };

  return (
    <>
      <div>
        <Space wrap>
          <Select
            style={{ width: 120 }}
            onChange={handleChange}
            value={value}
            options={[
              { value: "All events", label: "All events" },
              { value: "PageView", label: "PageView" },
              { value: "ViewContent", label: "ViewContent" },
              { value: "AddToCart", label: "AddToCart" },
              { value: "InitiateCheckout", label: "InitiateCheckout" },
            ]}
          />
        </Space>
      </div>
      <div id="chart" style={{ width: 1200, height: 500 }}></div>
    </>
  );
};

export default App;
