import React, { useState, useEffect, useRef } from "react";
const PreviewWindow = ({ timeline, currentFrame, size }) => {
    console.log("frame:" + currentFrame, timeline);
    const imgOutRef = useRef(null);
    const imgOutAreaRef = useRef(null);
    const timelineRef = useRef(null);

    useEffect(() => {
        const setupCanvas = async () => {
            const canvas = document.querySelector("canvas");
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                throw new Error("No appropriate GPUAdapter found.");
            }
            const device = await adapter.requestDevice();
            const context = canvas.getContext("webgpu");
            const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
            context.configure({
                device: device,
                format: canvasFormat,
            });
            const GRID_SIZE = 25;
            // Create a uniform buffer that describes the grid.
            const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
            const uniformBuffer = device.createBuffer({
                label: "Grid Uniforms",
                size: uniformArray.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            device.queue.writeBuffer(uniformBuffer, 0, uniformArray);
            const vertices = new Float32Array([
                //   X,    Y,
                -0.8,
                -0.8, // Triangle 1 (Blue)
                0.8,
                -0.8,
                0.8,
                0.8,

                -0.8,
                -0.8, // Triangle 2 (Red)
                0.8,
                0.8,
                -0.8,
                0.8,
            ]);
            const vertexBuffer = device.createBuffer({
                label: "Cell vertices",
                size: vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            });
            device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);
            const vertexBufferLayout: GPUVertexBufferLayout = {
                arrayStride: 8,
                attributes: [
                    {
                        format: "float32x2",
                        offset: 0,
                        shaderLocation: 0, // Position, see vertex shader
                    },
                ],
            };

            const cellShaderModule = device.createShaderModule({
                label: "Cell shader",
                code: `
@group(0) @binding(0) var<uniform> grid: vec2f;

@vertex
fn vertexMain(@location(0) pos: vec2f,
              @builtin(instance_index) instance: u32) ->
  @builtin(position) vec4f {

  let i = f32(instance);
  // Compute the cell coordinate from the instance_index
  let cell = vec2f(i % grid.x, floor(i / grid.x));

  let cellOffset = cell / grid * 2;
  let gridPos = (pos + 1) / grid - 1 + cellOffset;

  return vec4f(gridPos, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
}
  `,
            });
            const cellPipeline = device.createRenderPipeline({
                label: "Cell pipeline",
                layout: "auto",
                vertex: {
                    module: cellShaderModule,
                    entryPoint: "vertexMain",
                    buffers: [vertexBufferLayout],
                },
                fragment: {
                    module: cellShaderModule,
                    entryPoint: "fragmentMain",
                    targets: [
                        {
                            format: canvasFormat,
                        },
                    ],
                },
            });

            const bindGroup = device.createBindGroup({
                label: "Cell renderer bind group",
                layout: cellPipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: uniformBuffer },
                    },
                ],
            });

            const encoder = device.createCommandEncoder();
            const pass = encoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: context.getCurrentTexture().createView(),
                        loadOp: "clear",
                        clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
                        storeOp: "store",
                    },
                ],
            });
            pass.setPipeline(cellPipeline);
            pass.setVertexBuffer(0, vertexBuffer);
            pass.setBindGroup(0, bindGroup);
            pass.draw(vertices.length / 2); // 6 vertices
            pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);
            pass.end();
            const commandBuffer = encoder.finish();
            device.queue.submit([commandBuffer]);
            device.queue.submit([encoder.finish()]);
        };

        setupCanvas();
    }, []);

    //サイズが変更されたときのリサイズ
    useEffect(() => {
        const resize = () => {
            let imgOutArea = document.getElementById("imgOutArea");
            // videoConfig から幅と高さを取得
            const { height: dh, width: dw } = videoConfig;
            let rw = 0,
                rh = 0;
            const parent = imgOutArea.getBoundingClientRect();
            const margin = 20;
            const ww = parent.width - margin;
            const wh = parent.height - margin;
            let csc = 1;
            const hcsc = ww / dw;
            const wcsc = wh / dh;

            if (hcsc > wcsc) {
                csc = wcsc;
                rw = (ww - dw * csc) / 2;
            } else {
                csc = hcsc;
                rh = (wh - dh * csc) / 2;
            }

            // 直接スタイルを更新
            const imgOutEl = imgOutRef.current;
            imgOutEl.height = `${dh}`;
            imgOutEl.width = `${dw}`;
            imgOutEl.style.marginTop = `${rh}px`;
            imgOutEl.style.marginBottom = `${rh}px`;
            imgOutEl.style.marginLeft = `${rw}px`;
            imgOutEl.style.marginRight = `${rw}px`;
            imgOutEl.style.transform = `scale(${csc},${csc})`;

            // Timeline スタイルの更新
            const timelineEl = timelineRef.current;
            if (timelineEl) {
                timelineEl.style.setProperty(
                    "--tl-timebar-height",
                    `${Math.max(timelineEl.getBoundingClientRect().height - 13)}px`
                );
            }
        };

        // イベントリスナーを設定
        window.addEventListener("resize", resize);

        // 最初のリサイズをトリガー
        resize();

        // クリーンアップ関数
        return () => {
            window.removeEventListener("resize", resize);
        };
    }, [size]);

    // ビデオ設定の変数
    let videoConfig = {
        height: 1080, // ビデオの高さ
        width: 1920, // ビデオの幅
    };
    return (
        <div className="w-full bg-slate-8000" ref={imgOutAreaRef}>
            <canvas id="imgOut" ref={imgOutRef}></canvas>
        </div>
    );
};
export default PreviewWindow;
