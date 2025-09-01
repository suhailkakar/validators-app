"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconTrendingUp } from "@tabler/icons-react";
import { useEffect } from "react";

export function TacPriceChart() {
  useEffect(() => {
    const injectShadowStyles = () => {
      // Find the gecko widget element (the host)
      const hostElement = document.querySelector(
        "gecko-coin-price-chart-widget"
      );

      if (hostElement && hostElement.shadowRoot) {
        // Create style element
        const style = document.createElement("style");
        style.innerHTML = `
          .highcharts-color-positive {
            stroke: #8f029a !important;
          }

          .highcharts-color-negative {
            stroke: #8f029a !important;
          }

          .highcharts-area-series.highcharts-color-positive,
          .highcharts-area.zone-positive {
            fill: url(#purpleGradient) !important;
          }

            .highcharts-area-series.highcharts-color-negative,
          .highcharts-area.zone-negative {
            fill: url(#purpleGradient) !important;
          }
        `;

        // Create SVG gradient definition - wait for chart to fully load
        const svg = hostElement.shadowRoot.querySelector("svg");
        if (svg) {
          // Find existing defs or create one carefully
          let defs = svg.querySelector("defs");
          if (!defs) {
            defs = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "defs"
            );
            // Append to end to avoid disrupting existing structure
            svg.appendChild(defs);
          }

          // Only add gradient if it doesn't exist
          if (!defs.querySelector("#purpleGradient")) {
            // Create linear gradient
            const gradient = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "linearGradient"
            );
            gradient.setAttribute("id", "purpleGradient");
            gradient.setAttribute("x1", "0%");
            gradient.setAttribute("y1", "0%");
            gradient.setAttribute("x2", "0%");
            gradient.setAttribute("y2", "100%");

            // Purple to transparent stops
            const stop1 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop1.setAttribute("offset", "0%");
            stop1.setAttribute("stop-color", "#8f029a80");
            stop1.setAttribute("stop-opacity", "0.8");

            const stop2 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop2.setAttribute("offset", "100%");
            stop2.setAttribute("stop-color", "#8f029a");
            stop2.setAttribute("stop-opacity", "0");

            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            console.log("Gradient added without disrupting widget");
          }
        }

        hostElement.shadowRoot.appendChild(style);
        console.log("Shadow DOM styles injected successfully");
      } else {
        console.log("Widget not ready or no shadowRoot access");
      }
    };

    // Try multiple times with increasing delays
    setTimeout(injectShadowStyles, 100);
  }, []);

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTrendingUp className="h-5 w-5" />
          TAC Price Chart
        </CardTitle>
        <CardDescription>
          Real-time TAC price movements and market data
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full -mt-6 p-0 ">
        {/* @ts-expect-error gecko-coin-price-chart-widget is not a valid element */}
        <gecko-coin-price-chart-widget
          locale="en"
          transparent-background="true"
          coin-id="tac"
          initial-currency="usd"
          width="0"
        >
          {/* @ts-expect-error gecko-coin-price-chart-widget is not a valid element */}
        </gecko-coin-price-chart-widget>
      </CardContent>
    </Card>
  );
}
