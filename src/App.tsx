import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

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
  createdAt:string;
  PageView: string;
  data: string[];
};

const ChartFromAPI: React.FC = () => {
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
        const labels = responseData.map((item: Item) => {
          const date = new Date(item.createdAt);
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        });
        
        console.log(labels);

        const pageViews = responseData.map((item: Item) => item.PageView); 


        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Page Views",
              data: pageViews,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 1,
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
    const ctx = document.getElementById("myChart") as HTMLCanvasElement;

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

  return <canvas id="myChart" width="400" height="400"></canvas>;
};

export default ChartFromAPI;
