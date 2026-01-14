
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyser, isPlaying }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!svgRef.current || !analyser) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const barCount = 40;
    const barWidth = (width / barCount) * 0.8;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const x = d3.scaleLinear().domain([0, barCount]).range([0, width]);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const bars = svg.selectAll('rect').data(Array.from({ length: barCount }, (_, i) => {
        const idx = Math.floor((i / barCount) * (bufferLength / 4));
        return isPlaying ? dataArray[idx] : 0;
      }));

      bars.enter()
        .append('rect')
        .merge(bars as any)
        .attr('x', (_, i) => x(i))
        .attr('y', d => height - (d / 255) * height)
        .attr('width', barWidth)
        .attr('height', d => (d / 255) * height)
        .attr('fill', (d, i) => d3.interpolateGreens(0.4 + (d / 255) * 0.6))
        .attr('rx', 4);

      bars.exit().remove();
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying]);

  return (
    <div className="w-full h-24 flex items-end justify-center overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
