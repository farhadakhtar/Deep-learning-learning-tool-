"use client";
import U2ParamCount from "@/components/learn/widgets/u2-param-count";
import U2ConvLab from "@/components/learn/widgets/u2-conv-lab";
import U2SizeCalc from "@/components/learn/widgets/u2-size-calc";
import U2PoolingLab from "@/components/learn/widgets/u2-pooling-lab";
import U2RfLab from "@/components/learn/widgets/u2-rf-lab";
import U2TrainLoop from "@/components/learn/widgets/u2-train-loop";
import U2InitLab from "@/components/learn/widgets/u2-init-lab";
import U2BatchnormLab from "@/components/learn/widgets/u2-batchnorm-lab";
import U2DropoutLab from "@/components/learn/widgets/u2-dropout-lab";
import U2ArchGallery from "@/components/learn/widgets/u2-arch-gallery";

export default function Smoke() {
  return (
    <main className="space-y-4 p-4">
      <U2ParamCount />
      <U2ConvLab />
      <U2SizeCalc />
      <U2PoolingLab />
      <U2RfLab />
      <U2TrainLoop />
      <U2InitLab />
      <U2BatchnormLab />
      <U2DropoutLab />
      <U2ArchGallery />
    </main>
  );
}
