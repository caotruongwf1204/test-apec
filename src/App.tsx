import { useEffect, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

import { Select, Space } from "antd";

const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};

interface ChartData {
  labels: number[];
  datasets: {
    label: string;
    data: number[]; // Chuyển từ dạng chuỗi sang số nguyên
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
}
type Item = {
  id: number;
  createdAt: string;
  PageView: string;
  ViewContent: string;
  AddToCart: string;
  InitiateCheckout: string;
};

const App = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://shopify.gapsoftware.asia/api/event/All?shop=lucky-birds-store.myshopify.com"
        );
        const responseData = response.data;
        console.log(responseData);
        const dateTime = responseData.map((item: Item) => {
          const date = new Date(item.createdAt);
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        });

     

        setChartData({
          labels: dateTime,
          datasets: [
            {
              label: "Page Views",
              data: [],
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 1,
            },
            {
              label: "ViewContent",
              data: [],
              fill: false,
              borderColor: "rgb(192, 75, 75)",
              tension: 1,
            },
            {
              label: "AddToCart",
              data: [],
              fill: false,
              borderColor: "rgb(75, 192, 75)",
              tension: 1,
            },
            {
              label: "InitiateCheckout",
              data: [0, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 7, 5],
              fill: false,
              borderColor: "rgb(192, 192, 75)",
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const ctx = document.querySelector(".myChart") as HTMLCanvasElement;

    const newChart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
            },
          },
          y: {
            title: {
              display: true,
              text: "Total",
            },
            min: 0,
            max: 10,
          },
        },
      },
    });

    return () => {
      newChart.destroy();
    };
  }, [chartData]);

  return (
    <>
      <div>
        <Space wrap>
          <Select
            defaultValue="All events"
            style={{ width: 120 }}
            onChange={handleChange}
            options={[
              { value: "PageView", label: "PageView" },
              { value: "ViewContent", label: "ViewContent" },
              { value: "AddToCart", label: "AddToCart" },
              { value: "InitiateCheckout", label: "InitiateCheckout" },
            ]}
          />
        </Space>
      </div>
      <div>
        <canvas className="myChart" width="400" height="400"></canvas>
      </div>
    </>
  );
};

export default App;
