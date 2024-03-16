import { useEffect, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

import { Select, Space } from "antd";

const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[]; // Chuyển từ dạng chuỗi sang số nguyên
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
}
// type Item = {
//   id: number;
//   createdAt: string;
//   PageView: string;
//   ViewContent: string;
//   AddToCart: string;
//   InitiateCheckout: string;
// };

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

        //Buoc 1: Loc truoc xem thuoc eventName nao ?
        const extractEventNames = (events) => {
          const eventNames = new Set();
          events.forEach((event) => {
            eventNames.add(event.eventName);
          });
          return Array.from(eventNames);
        };

        const eventNames = extractEventNames(responseData);
        console.log(eventNames);

        const desiredEventNames = [
          "PageView",
          "ViewContent",
          "AddToCart",
          "InitiateCheckout",
        ];
        const filteredEventNames = eventNames.filter((eventName) =>
          desiredEventNames.includes(eventName)
        );
        // Buoc 2: Set cung khoang thoi gian
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

        // Buoc 3: Convert ve mang dataTest
        // Hàm kiểm tra xem một thời gian có nằm trong khoảng thời gian cố định hay không
        const isInTimeRange = (eventTime, startTime, endTime) => {
          return (eventTime >= startTime) && (eventTime < endTime);
        };

        // Hàm lọc dữ liệu theo khoảng thời gian
        const filterDataByTime = (responseData, time, eventName) => {
          const dataTest = time
            .map((startTime, index) => {
              // Khoang thoi gian ket thuc
              const endTime = time[index + 1];

              // Dem so luong su kien trong khoang thoi gian gan vao count
              const count = responseData.filter((e) => {
                const eventTime = new Date(
                  parseInt(e.eventTime) * 1000
                ).toLocaleTimeString("en-US", { hour12: false });
                // console.log(eventTime, "eventTime");

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

        const datasets = [];


        filteredEventNames.forEach((eventName) => {
          const dataChart = filterDataByTime(responseData, time, eventName);
          // console.log(`Data for event "${eventName}":`, dataChart);

          const dataCount = dataChart.map((item) => item.count);
          // console.log(`Data count for event "${eventName}":`, dataCount);

          const dataset = {
            label: eventName,
            data: dataCount,
            fill: false,
            tension: 0.1,
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
            max: 30,
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
