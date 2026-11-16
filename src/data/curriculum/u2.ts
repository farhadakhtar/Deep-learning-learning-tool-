import type { Unit } from "@/lib/content/types";

export const u2: Unit = {
  id: "u2",
  number: 2,
  code: "UNIT 2",
  title: "Convolutional Neural Networks",
  subtitle: "ConvNets · Training · Initialization · BatchNorm · Dropout · Architectures",
  description:
    "Build convolutions, pooling, padding and stride from first principles, master the training machinery — loss, backpropagation, initialization, batch normalization, dropout and hyperparameter search — and tour the four great architectures: AlexNet, VGG, Inception and ResNet.",
  sourceFile: "CCE3144_Deep_Learning_CNN_Unit2.pdf",
  topics: ["Convolution", "Pooling", "Batch Normalization", "AlexNet · VGG · Inception · ResNet"],
  lessons: [
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l1",
      title: "Convolutional Neural Networks — The Big Picture",
      subtitle: "What CNNs are, why dense networks choke on images, and the pipeline that replaced them.",
      minutes: 10,
      sections: [
        {
          id: "u2-l1-s1",
          title: "What is a CNN?",
          blocks: [
            {
              type: "text",
              value:
                "A **Convolutional Neural Network (CNN / ConvNet)** is a deep learning architecture built specifically for **grid-structured data** such as images (a 2-D grid of pixels).",
            },
            {
              type: "bullets",
              items: [
                "Instead of treating every pixel as an independent input feature (as a plain dense network would), a CNN learns **small filters (kernels)** that slide across the image and detect **local patterns** — edges, corners, textures, colours.",
                "CNNs are the backbone of almost all modern computer-vision systems: **image classification, object detection, segmentation, face recognition, medical-image analysis, and self-driving perception**.",
              ],
            },
          ],
        },
        {
          id: "u2-l1-s2",
          title: "Why not simply use a dense network on an image?",
          blocks: [
            {
              type: "text",
              value:
                "A dense (fully connected) layer connects **every input pixel to every neuron**. For images this is extremely wasteful, as the next example shows.",
            },
            { type: "widget", widgetId: "u2-param-count", title: "Dense vs convolution — parameter counter", description: "Set the image size, hidden neurons, filter count and filter size, and watch both parameter counts update live. Notice the convolution count never depends on the image's spatial size." },
            {
              type: "example",
              title: "Example 1.1 — Parameter explosion in a plain dense network",
              given: [
                "A small colour image of size 32×32×3 is fed to a hidden layer of 1000 neurons",
                "Compare the number of parameters needed by (a) a fully-connected layer and (b) a convolution layer with 10 filters of size 5×5×3",
              ],
              steps: [
                {
                  label: "Step 1 — Flatten the image",
                  blocks: [{ type: "formula", tex: "32 \\times 32 \\times 3 = 3072 \\text{ input values}" }],
                },
                {
                  label: "Step 2 — Dense layer parameter count",
                  blocks: [
                    { type: "text", value: "Each of the 1000 neurons needs its own weight for every one of the 3072 inputs, plus 1 bias." },
                    { type: "formula", tex: "\\text{Params} = (3072 \\times 1000) + 1000 = 3{,}073{,}000" },
                  ],
                },
                {
                  label: "Step 3 — Convolution layer parameter count",
                  blocks: [
                    { type: "text", value: "10 filters, each 5×5×3, are reused (slid) across the whole image." },
                    { type: "formula", tex: "\\text{Params} = (5 \\times 5 \\times 3 + 1) \\times 10 = 76 \\times 10 = 760" },
                  ],
                },
                {
                  label: "Step 4 — Compare",
                  blocks: [{ type: "formula", tex: "3{,}073{,}000 \\div 760 \\approx 4043" }],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "The convolution layer needs about **4000× fewer parameters** than the dense layer, because the same small filter is reused at every location instead of learning a brand-new weight for every pixel. Fewer parameters means **faster training, less memory**, and (importantly) **less overfitting** on limited data.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l1-s3",
          title: "Key ideas that make CNNs efficient",
          blocks: [
            { type: "text", value: "Four structural ideas give CNNs their edge on image data:" },
            {
              type: "bullets",
              items: [
                "**Local connectivity (sparse interactions)** — each neuron in a conv layer looks at only a small local patch (its **receptive field**) of the input, not the entire image.",
                "**Parameter sharing** — the same filter weights are used at every spatial position, so a pattern learned in one corner of the image (say, a vertical edge) can be detected anywhere else in the image with the very same filter.",
                "**Translation invariance** — because the filter scans the whole image, the network can recognise an object even after it shifts position within the frame.",
                "**Hierarchical feature learning** — early layers learn simple features (edges, colour blobs); deeper layers combine these into increasingly complex features (textures, object parts, whole objects).",
              ],
            },
          ],
        },
        {
          id: "u2-l1-s4",
          title: "The overall CNN pipeline",
          blocks: [
            {
              type: "text",
              value:
                "A typical CNN is simply a stack of a few standard building blocks, repeated and then followed by a classifier head (the classic LeNet-style layout):",
            },
            {
              type: "formula",
              tex: "\\text{Input} \\rightarrow [\\,\\text{Conv} \\rightarrow \\text{ReLU} \\rightarrow \\text{Pool}\\,] \\times \\text{a few} \\rightarrow \\text{Flatten} \\rightarrow \\text{FC} \\rightarrow \\text{Softmax}",
              caption: "Alternating Conv+ReLU and Pooling blocks extract features; fully-connected layers then classify them",
            },
            {
              type: "table",
              headers: ["Block", "What it does"],
              rows: [
                ["Convolution layer", "Applies learnable filters to extract local features and produces feature maps"],
                ["Activation function (ReLU)", "Introduces non-linearity so the network can model complex, non-linear relationships"],
                ["Pooling layer", "Down-samples feature maps, cutting computation and adding a small amount of translation invariance"],
                ["Fully Connected (Dense) layer", "After feature extraction, the high-level features are flattened and passed through dense layers for final decision-making"],
                ["Softmax", "Converts the last layer's raw scores (logits) into class probabilities that sum to 1"],
              ],
            },
          ],
        },
        {
          id: "u2-l1-s5",
          title: "CNN vs. traditional neural network — quick comparison",
          blocks: [
            {
              type: "table",
              headers: ["Aspect", "Plain Dense (Fully Connected) Network", "Convolutional Neural Network"],
              rows: [
                ["Connectivity", "Every input connects to every neuron", "Each neuron sees only a small local patch"],
                ["Parameters", "Extremely large for image-sized input", "Far fewer, due to weight/filter sharing"],
                ["Spatial structure", "Ignored — image must be flattened", "Preserved — filters operate on 2-D patches"],
                ["Translation invariance", "None by default", "Built in, via shared filters + pooling"],
                ["Typical use", "Tabular / generic data", "Images, video frames, spatial-grid data"],
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-1",
                  question: "The same small set of filter weights is applied at every spatial position of the input. This core CNN idea is called:",
                  options: ["Local connectivity", "Parameter sharing", "Padding", "Pooling"],
                  correct: 1,
                  explanation:
                    "Parameter sharing reuses one small filter everywhere, so a pattern learned in one corner is detected anywhere — this is what keeps the parameter count in Example 1.1 down to 760.",
                },
                {
                  id: "u2-check-2",
                  question: "In the standard CNN pipeline, which component turns the final raw scores (logits) into class probabilities that sum to 1?",
                  options: ["ReLU", "Pooling layer", "Softmax", "Flatten"],
                  correct: 2,
                  explanation:
                    "Softmax converts the last layer's raw scores (logits) into a probability distribution over the classes.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l2",
      title: "The Convolution Operation",
      subtitle: "Filters, feature maps and the sliding-window dot product — with the full 9-position worked example.",
      minutes: 14,
      sections: [
        {
          id: "u2-l2-s1",
          title: "What is a filter (kernel)?",
          blocks: [
            {
              type: "bullets",
              items: [
                "A **filter (kernel)** is a small matrix of learnable weights — commonly 3×3, 5×5, or 7×7.",
                "It is **convolved (slid)** across the input, computing one dot product at every position it stops on.",
                "Each filter learns to detect a **specific pattern** — a vertical edge, a horizontal edge, a colour blob, a texture, and so on.",
                "A convolution layer normally has **many filters**. Each filter produces its own 2-D **feature map** (activation map); stacking all of them gives the 3-D output volume of the layer.",
              ],
            },
          ],
        },
        {
          id: "u2-l2-s2",
          title: "The sliding-window computation — step by step",
          blocks: [
            {
              type: "numbered",
              items: [
                "**Place** the filter over the top-left corner of the input.",
                "**Multiply** each filter weight by the input value it currently overlaps (element-wise).",
                "**Sum** all the products (add a bias term if used) — this single number becomes **ONE entry** of the output feature map.",
                "**Slide** the filter by the stride (number of pixels moved per step) and repeat Steps 2–3, until the filter has swept over the whole input.",
              ],
            },
          ],
        },
        {
          id: "u2-l2-s3",
          title: "Worked example — convolving a 5×5 input with a 3×3 filter",
          blocks: [
            { type: "widget", widgetId: "u2-conv-lab", title: "Convolution laboratory", description: "Slide a 3×3 filter across a 5×5 input exactly as in Example 2.1 — step through all nine positions and watch each dot product build the output feature map." },
            {
              type: "example",
              title: "Example 2.1 — Full convolution computation",
              given: [
                "Input (5×5) and filter (3×3) as shown in Figure 2.1 of the notes",
                "Stride = 1, no padding",
              ],
              steps: [
                {
                  label: "Step 1 — Output size",
                  blocks: [
                    { type: "text", value: "With $N=5$, $F=3$, $S=1$, $P=0$, the output is $(5-3)/1+1 = 3$, so a **3×3 feature map** (9 values to compute)." },
                  ],
                },
                {
                  label: "Step 2 — Compute the top-left value (position 0,0)",
                  blocks: [
                    { type: "formula", tex: "(1 \\times 1 + 1 \\times 0 + 1 \\times 1) + (0 \\times 0 + 1 \\times 1 + 1 \\times 0) + (0 \\times 1 + 0 \\times 0 + 1 \\times 1) = 2 + 1 + 1 = 4" },
                  ],
                },
                {
                  label: "Step 3 — Slide the filter one column right and repeat for every position",
                  blocks: [
                    {
                      type: "table",
                      headers: ["Output position", "Element-wise sum (row by row)", "Value"],
                      rows: [
                        ["(0,0)", "(1+0+1)+(0+1+0)+(0+0+1)", "4"],
                        ["(0,1)", "(1+0+0)+(0+1+0)+(0+0+1)", "3"],
                        ["(0,2)", "(1+0+0)+(0+1+0)+(1+0+1)", "4"],
                        ["(1,0)", "(0+0+1)+(0+0+0)+(0+0+1)", "2"],
                        ["(1,1)", "(1+0+1)+(0+1+0)+(0+0+1)", "4"],
                        ["(1,2)", "(1+0+0)+(0+1+0)+(1+0+0)", "3"],
                        ["(2,0)", "(0+0+1)+(0+0+0)+(0+0+1)", "2"],
                        ["(2,1)", "(0+0+1)+(0+1+0)+(1+0+0)", "3"],
                        ["(2,2)", "(1+0+1)+(0+0+0)+(1+0+0)", "4"],
                      ],
                      caption: "All nine dot products — one per filter position",
                    },
                  ],
                },
                {
                  label: "Result — the output feature map",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\text{Output} = \\begin{bmatrix} 4 & 3 & 4 \\\\ 2 & 4 & 3 \\\\ 2 & 3 & 4 \\end{bmatrix}",
                      caption: "The 3×3 feature map — matches Figure 2.1 of the notes exactly",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l2-s4",
          title: "Multiple filters and multi-channel inputs",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Depth of a filter always matches the depth of its input.** If the input has $C$ channels (e.g. $C=3$ for an RGB image), every filter is actually $F \\times F \\times C$ — it convolves across all channels simultaneously and the $C$ partial sums are added together, giving back a single 2-D number per position (not $C$ separate maps).",
                "**Number of output channels = number of filters.** Using $K$ independent filters on the same input produces $K$ separate 2-D feature maps, stacked to form a volume of depth $K$.",
              ],
            },
            {
              type: "example",
              title: "Example 2.2 — Parameters for a multi-channel convolution layer",
              given: [
                "Input volume 32×32×3 (RGB)",
                "10 filters of size 5×5, stride 1, no padding",
              ],
              steps: [
                {
                  label: "Step 1 — Each filter's true shape is 5×5×3",
                  blocks: [{ type: "text", value: "The filter's depth matches the input depth automatically." }],
                },
                {
                  label: "Step 2 — Parameters per filter (including 1 bias)",
                  blocks: [{ type: "formula", tex: "(5 \\times 5 \\times 3) + 1 = 75 + 1 = 76" }],
                },
                {
                  label: "Step 3 — Total parameters for 10 filters",
                  blocks: [{ type: "formula", tex: "76 \\times 10 = 760 \\text{ parameters}" }],
                },
                {
                  label: "Step 4 — Output volume size",
                  blocks: [
                    { type: "text", value: "Spatial size $= (32-5)/1+1 = 28$; depth $=$ number of filters $= 10$ — so the output volume is **28×28×10**." },
                  ],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "The parameter count (760) **does not depend on the image's spatial size (32×32) at all** — only on the filter size, input depth, and number of filters. This is exactly why CNNs scale so much better than dense networks to large images.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l2-s5",
          title: "Key terminology recap",
          blocks: [
            {
              type: "table",
              headers: ["Term", "Meaning"],
              rows: [
                ["Filter / Kernel", "Small matrix of learnable weights used to scan the input"],
                ["Stride", "Number of pixels the filter moves at each step"],
                ["Feature map / Activation map", "Output produced by convolving one filter over the input"],
                ["Receptive field", "The region of the input that influences one output value"],
                ["Depth / Channels", "Number of feature maps stacked together in a volume"],
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-3",
                  question: "A convolution layer applies 16 filters to a single input volume. The depth of the layer's output volume is:",
                  options: ["The same as the input depth", "16 — one feature map per filter", "1, because each filter outputs a 2-D map", "Always 3"],
                  correct: 1,
                  explanation:
                    "Number of output channels = number of filters: K filters produce K separate 2-D feature maps, stacked into an output volume of depth K.",
                },
                {
                  id: "u2-check-4",
                  question: "If the input has 3 colour channels, each 5×5 filter in the first convolution layer actually has shape:",
                  options: ["5×5", "5×5×3", "3×3×5", "5×5×5"],
                  correct: 1,
                  explanation:
                    "A filter's depth always matches its input's depth — it convolves across all channels simultaneously and adds the partial sums into a single 2-D output.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l3",
      title: "Padding and Stride",
      subtitle: "Controlling output size with zero borders and step lengths — and why stacked small filters beat one big one.",
      minutes: 13,
      sections: [
        {
          id: "u2-l3-s1",
          title: "Why do we need padding?",
          blocks: [
            {
              type: "bullets",
              items: [
                "Without padding, the spatial size **shrinks after every convolution** (e.g. 32→28→24…), which limits how many layers a network can have.",
                "**Border pixels are used far less often** than centre pixels — a corner pixel is covered by the filter only once, while a centre pixel is covered many times — so border information is under-represented.",
                "Padding adds a border (almost always **zeros**) around the input so that we can: (1) **control / preserve the output size**, and (2) give **border pixels fairer coverage**.",
              ],
            },
          ],
        },
        {
          id: "u2-l3-s2",
          title: "Types of padding",
          blocks: [
            {
              type: "table",
              headers: ["Type", "Meaning", "Effect on output size"],
              rows: [
                ["Valid (P = 0)", "No padding added", "Output is smaller than the input"],
                ["Same", "Just enough zero padding added", "Output size equals input size (stride = 1)"],
                ["Full", "Maximum padding (filter starts with 1 pixel overlap)", "Output is larger than the input (rarely used)"],
              ],
            },
          ],
        },
        {
          id: "u2-l3-s3",
          title: "The general output-size formula",
          blocks: [
            { type: "text", value: "For an $N \\times N$ input, filter size $F$, padding $P$, and stride $S$, the output spatial size $O$ is:" },
            {
              type: "formula",
              tex: "O = \\left\\lfloor \\frac{N + 2P - F}{S} \\right\\rfloor + 1",
              caption: "N = input size (height or width), F = filter size, P = padding (pixels added on each side), S = stride",
            },
            {
              type: "bullets",
              items: [
                "The division is followed by a **floor (round down)**: if the filter does not fit an exact whole number of times, the last partial slide is simply not used.",
              ],
            },
            { type: "widget", widgetId: "u2-size-calc", title: "Output-size calculator", description: "Drag N, F, P and S and watch O respond. Try the 'same' preset and see P snap to (F−1)/2 — and notice what stride 2 does to the map size." },
          ],
        },
        {
          id: "u2-l3-s4",
          title: "Worked examples — same padding and stride",
          blocks: [
            {
              type: "example",
              title: "Example 3.1 — Solve for the padding that keeps output size = input size",
              given: ["N = 5, F = 3, S = 1", "Find P such that O = N ('same' padding)"],
              steps: [
                {
                  label: "Step 1 — Start from the output formula and set O = N",
                  blocks: [{ type: "formula", tex: "N = \\frac{N + 2P - F}{S} + 1" }],
                },
                {
                  label: "Step 2 — With S = 1, simplify",
                  blocks: [{ type: "formula", tex: "N - 1 = N + 2P - F \\;\\Rightarrow\\; 2P = F - 1 \\;\\Rightarrow\\; P = \\frac{F-1}{2}" }],
                },
                {
                  label: "Step 3 — Substitute F = 3",
                  blocks: [{ type: "formula", tex: "P = \\frac{3-1}{2} = 1" }],
                },
                {
                  label: "Step 4 — Verify by plugging back in",
                  blocks: [{ type: "formula", tex: "O = \\frac{5 + 2 \\times 1 - 3}{1} + 1 = \\frac{4}{1} + 1 = 5 \\;\\checkmark" }],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "The neat formula $P = (F-1)/2$ only gives a **whole number when F is odd** — this is exactly why almost all CNN filters use odd sizes (3×3, 5×5, 7×7).",
                    },
                  ],
                },
              ],
            },
            {
              type: "example",
              title: "Example 3.2 — Output size with stride 2",
              given: ["(a) N = 7, F = 3, S = 2, P = 0", "(b) N = 9, F = 3, S = 2, P = 1"],
              steps: [
                {
                  label: "(a) N = 7, F = 3, S = 2, P = 0",
                  blocks: [{ type: "formula", tex: "O = \\left\\lfloor \\frac{7 - 3}{2} \\right\\rfloor + 1 = \\left\\lfloor \\frac{4}{2} \\right\\rfloor + 1 = 2 + 1 = 3" }],
                },
                {
                  label: "(b) N = 9, F = 3, S = 2, P = 1",
                  blocks: [{ type: "formula", tex: "O = \\left\\lfloor \\frac{9 + 2 - 3}{2} \\right\\rfloor + 1 = \\left\\lfloor \\frac{8}{2} \\right\\rfloor + 1 = 4 + 1 = 5" }],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "A larger stride skips positions, so the filter is applied fewer times — the feature map **shrinks faster and computation drops**, but some fine spatial detail can be lost.",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Exam tip — one formula rules them all",
              blocks: [
                {
                  type: "text",
                  value:
                    "$O = \\lfloor (N + 2P - F)/S \\rfloor + 1$ handles **convolution and pooling alike** (pooling simply uses $P = 0$ almost always). Most numerical questions on this unit are direct applications of it — memorise it.",
                },
              ],
            },
          ],
        },
        {
          id: "u2-l3-s5",
          title: "Receptive field — why stacking small filters works so well",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Receptive field** = the region of the original input image that a given output neuron is influenced by.",
                "Even though each individual filter may be small (e.g. 3×3), stacking several conv layers makes the effective receptive field **grow with depth**.",
              ],
            },
            { type: "text", value: "For stride-1 layers, each additional $F \\times F$ conv layer grows the receptive field by $(F-1)$:" },
            {
              type: "formula",
              tex: "RF_{\\text{out}} = RF_{\\text{in}} + (F - 1)",
              caption: "Receptive-field growth per stride-1 convolution layer",
            },
            { type: "widget", widgetId: "u2-rf-lab", title: "Receptive-field builder", description: "Stack convolution layers and watch the receptive field grow by F−1 per layer. Compare three stacked 3×3 layers against one 7×7 filter — same receptive field, far fewer parameters." },
            {
              type: "example",
              title: "Example 3.3 — Receptive field of three stacked 3×3 convolutions",
              steps: [
                {
                  label: "Layer 1 (3×3)",
                  blocks: [{ type: "formula", tex: "RF = 3" }],
                },
                {
                  label: "Layer 2 (3×3)",
                  blocks: [{ type: "formula", tex: "RF = 3 + (3 - 1) = 5" }],
                },
                {
                  label: "Layer 3 (3×3)",
                  blocks: [{ type: "formula", tex: "RF = 5 + (3 - 1) = 7" }],
                },
                {
                  label: "Compare with a single 7×7 convolution",
                  blocks: [
                    { type: "text", value: "It also has RF = 7 — **the same receptive field!** But look at the parameter cost, for $C$ input/output channels at every layer:" },
                    { type: "formula", tex: "3 \\times (3 \\times 3 \\times C \\times C) = 27C^2 \\quad \\text{vs.} \\quad 1 \\times (7 \\times 7 \\times C \\times C) = 49C^2" },
                  ],
                },
                {
                  label: "With C = 64",
                  blocks: [
                    { type: "formula", tex: "27 \\times 64^2 = 110{,}592 \\;\\text{parameters} \\quad \\text{vs.} \\quad 49 \\times 64^2 = 200{,}704 \\;\\text{parameters}" },
                    { type: "text", value: "The stacked 3×3 filters use only about 55% as many parameters (**≈45% fewer**)." },
                  ],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "Three small filters reach the same receptive field as one big filter, with **fewer parameters AND two extra ReLU non-linearities** in between (making the network more expressive). This is precisely the design idea behind **VGG**.",
                    },
                  ],
                },
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-5",
                  question: "Most CNN filters use odd sizes (3×3, 5×5, 7×7) mainly because:",
                  options: [
                    "They compute faster on GPUs",
                    "'Same' padding P = (F−1)/2 is a whole number only when F is odd",
                    "Even filter sizes cause exploding gradients",
                    "Odd filters need no bias term",
                  ],
                  correct: 1,
                  explanation:
                    "With S = 1, preserving the input size requires P = (F−1)/2, which is only a whole number for odd F — hence 3×3, 5×5 and 7×7 filters (Example 3.1).",
                },
                {
                  id: "u2-check-6",
                  question: "Stacking three 3×3 convolution layers (stride 1) gives the same receptive field as a single:",
                  options: ["3×3 filter", "5×5 filter", "7×7 filter", "9×9 filter"],
                  correct: 2,
                  explanation:
                    "The receptive field grows 3 → 5 → 7, matching one 7×7 filter — but with only 27C² instead of 49C² parameters, plus two extra ReLU non-linearities (Example 3.3).",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l4",
      title: "Pooling",
      subtitle: "Max, average and global pooling — downsampling with zero learnable parameters.",
      minutes: 12,
      sections: [
        {
          id: "u2-l4-s1",
          title: "Why pooling?",
          blocks: [
            {
              type: "bullets",
              items: [
                "Pooling **reduces the spatial size** (height, width) of feature maps, cutting computation and the number of parameters needed in later layers.",
                "It provides a **small amount of translation invariance** — a tiny shift in the input barely changes the pooled output.",
                "It helps **control overfitting** by summarising a region instead of keeping every precise activation value.",
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Exam point — pooling has NO learnable parameters",
              blocks: [
                {
                  type: "text",
                  value:
                    "Pooling is a **fixed mathematical operation** (max or mean), unlike a convolution layer which has learnable weights and a bias. This is a favourite exam question.",
                },
              ],
            },
          ],
        },
        {
          id: "u2-l4-s2",
          title: "Types of pooling",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Max Pooling** — takes the maximum value inside each window; keeps the strongest / most 'present' activation.",
                "**Average Pooling** — takes the mean value inside each window; produces a smoother, less peaky summary.",
                "**Global Average Pooling (GAP)** — an extreme case that pools an **entire feature map down to a single number per channel**. Used in modern architectures (GoogLeNet, ResNet) right before the final classifier, in place of a large Flatten + Dense combination (see Example 4.2).",
              ],
            },
          ],
        },
        {
          id: "u2-l4-s3",
          title: "Worked example — max and average pooling",
          blocks: [
            { type: "widget", widgetId: "u2-pooling-lab", title: "Pooling laboratory", description: "Switch between max, average and global average pooling on the 4×4 input of Example 4.1 — watch each 2×2 window collapse to a single output value." },
            {
              type: "example",
              title: "Example 4.1 — Compute max pooling and average pooling",
              given: [
                "4×4 input (Figure 4.1 of the notes): $[[1,3,5,6],[2,4,1,2],[2,4,0,1],[3,1,2,5]]$",
                "Pooling window 2×2, stride 2",
              ],
              steps: [
                {
                  label: "Step 1 — Top-left window {1, 3, 5, 6}",
                  blocks: [{ type: "formula", tex: "\\max = 6 \\qquad \\text{mean} = \\frac{1+3+5+6}{4} = \\frac{15}{4} = 3.75" }],
                },
                {
                  label: "Step 2 — Top-right window {2, 4, 1, 2}",
                  blocks: [{ type: "formula", tex: "\\max = 4 \\qquad \\text{mean} = \\frac{2+4+1+2}{4} = \\frac{9}{4} = 2.25" }],
                },
                {
                  label: "Step 3 — Bottom-left window {2, 4, 0, 1}",
                  blocks: [{ type: "formula", tex: "\\max = 4 \\qquad \\text{mean} = \\frac{2+4+0+1}{4} = \\frac{7}{4} = 1.75" }],
                },
                {
                  label: "Step 4 — Bottom-right window {3, 1, 2, 5}",
                  blocks: [{ type: "formula", tex: "\\max = 5 \\qquad \\text{mean} = \\frac{3+1+2+5}{4} = \\frac{11}{4} = 2.75" }],
                },
                {
                  label: "Result",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\text{Max-pooled} = \\begin{bmatrix} 6 & 4 \\\\ 4 & 5 \\end{bmatrix} \\qquad \\text{Average-pooled} = \\begin{bmatrix} 3.75 & 2.25 \\\\ 1.75 & 2.75 \\end{bmatrix}",
                      caption: "Each coloured 2×2 block of the input becomes one output value",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l4-s4",
          title: "Output-size formula for pooling",
          blocks: [
            { type: "text", value: "Pooling uses the same size formula as convolution, with padding almost always 0:" },
            {
              type: "formula",
              tex: "O = \\left\\lfloor \\frac{N - F}{S} \\right\\rfloor + 1",
            },
            {
              type: "text",
              value:
                "Check against Example 4.1: $N=4$, $F=2$, $S=2 \\Rightarrow O = (4-2)/2 + 1 = 1 + 1 = 2$, giving the 2×2 output shown above.",
            },
          ],
        },
        {
          id: "u2-l4-s5",
          title: "Max pooling vs average pooling — when to use which",
          blocks: [
            {
              type: "table",
              headers: ["Aspect", "Max Pooling", "Average Pooling"],
              rows: [
                ["What it keeps", "The strongest activation in the window", "The overall / smoothed activation"],
                ["Sensitivity", "Highlights sharp features (edges, textures)", "Less sensitive to noise / outliers"],
                ["Typical placement", "Hidden layers (classic CNNs: AlexNet, VGG)", "Final layer, as Global Average Pooling"],
                ["Gradient flow (backprop)", "Gradient flows only to the max element", "Gradient is spread equally to all elements"],
              ],
            },
          ],
        },
        {
          id: "u2-l4-s6",
          title: "Global average pooling — parameter savings",
          blocks: [
            {
              type: "example",
              title: "Example 4.2 — Parameter savings from Global Average Pooling",
              given: [
                "The last conv feature map is 7×7×512 (as in VGG16)",
                "We need to connect it to a 1000-class output",
              ],
              steps: [
                {
                  label: "Option A — Flatten + Dense",
                  blocks: [
                    { type: "text", value: "Flatten to $7 \\times 7 \\times 512 = 25{,}088$ values, then a dense layer maps this to 4096 units." },
                    { type: "formula", tex: "\\text{Params} = 25{,}088 \\times 4096 + 4096 = 102{,}764{,}544" },
                  ],
                },
                {
                  label: "Option B — Global Average Pooling",
                  blocks: [
                    { type: "text", value: "Average each of the 512 channels over all $7 \\times 7 = 49$ positions → 512 numbers (**zero learnable parameters**), then connect directly to 1000 outputs." },
                    { type: "formula", tex: "\\text{Params} = 512 \\times 1000 + 1000 = 513{,}000" },
                  ],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "GAP needs roughly **200× fewer parameters** at the classifier head, which is exactly why GoogLeNet and ResNet use it instead of large fully-connected stacks — it also **reduces overfitting substantially**.",
                    },
                  ],
                },
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-7",
                  question: "Which pooling variant collapses an entire feature map down to a single number per channel?",
                  options: ["Max pooling", "Average pooling", "Global average pooling", "Overlapping pooling"],
                  correct: 2,
                  explanation:
                    "GAP averages a whole feature map to one value per channel; GoogLeNet and ResNet use it to replace huge Flatten + Dense heads (Example 4.2).",
                },
                {
                  id: "u2-check-8",
                  question: "During backpropagation, a max-pooling layer passes the incoming gradient:",
                  options: [
                    "Equally to every element in the window",
                    "Only to the element that produced the maximum",
                    "To the bias term",
                    "It blocks the gradient completely",
                  ],
                  correct: 1,
                  explanation:
                    "Max pooling routes all of the gradient to the single element that produced the max; average pooling splits it equally among all elements of the window.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l5",
      title: "Training a ConvNet",
      subtitle: "Forward pass, loss, backpropagation and gradient descent — with the complete single-neuron worked example.",
      minutes: 16,
      sections: [
        {
          id: "u2-l5-s1",
          title: "The training loop — overview",
          blocks: [
            {
              type: "text",
              value:
                "Training a CNN means repeatedly adjusting every filter weight and bias so that the network's predictions get closer to the true labels. This happens in a **four-step loop, repeated for every mini-batch, for many epochs**:",
            },
            { type: "widget", widgetId: "u2-train-loop", title: "The training loop, step by step", description: "Walk the four stages — forward pass, loss, backward pass, weight update — on the single neuron of Example 5.1 and watch the loss fall as the weights move." },
            {
              type: "numbered",
              items: [
                "**Forward Pass** — push a batch of images through every conv, pooling, and FC layer to get predictions.",
                "**Compute Loss** — compare the predictions with the true labels using a loss function $L$.",
                "**Backward Pass (Backpropagation)** — use the chain rule to compute the gradient of the loss with respect to every weight in the network.",
                "**Update Weights (Gradient Descent)** — nudge every weight a small step in the direction that reduces the loss.",
              ],
            },
          ],
        },
        {
          id: "u2-l5-s2",
          title: "Loss functions",
          blocks: [
            {
              type: "text",
              value:
                "**Cross-Entropy Loss** — the standard choice for classification. For $C$ classes with true one-hot label $y$ and predicted probabilities $\\hat{y}$ (from softmax):",
            },
            {
              type: "formula",
              tex: "L = -\\sum_{c=1}^{C} y_c \\log(\\hat{y}_c)",
              caption: "Cross-entropy loss for classification",
            },
            {
              type: "text",
              value:
                "**Mean Squared Error (MSE)** — common for regression, and useful for building intuition since its derivative is simple:",
            },
            {
              type: "formula",
              tex: "L = \\frac{1}{2}(y - \\hat{y})^2",
              caption: "Mean squared error (per-sample form used in the worked example)",
            },
          ],
        },
        {
          id: "u2-l5-s3",
          title: "Backpropagation — the chain rule",
          blocks: [
            {
              type: "bullets",
              items: [
                "Backpropagation computes $\\partial L/\\partial w$ (how much the loss changes if a weight $w$ changes) for **every weight** in the network, working backwards from the output.",
                "Each layer only needs two things: the gradient arriving from the layer in front of it (the **upstream gradient**), and its own **local derivative**. Multiplying these together (the chain rule) gives the gradient to pass further back.",
                "This is why deep networks are trainable at all — a complicated end-to-end derivative is broken into a **product of simple, local derivatives**, one layer at a time.",
              ],
            },
          ],
        },
        {
          id: "u2-l5-s4",
          title: "Worked example — full forward + backward pass for one neuron",
          blocks: [
            {
              type: "example",
              title: "Example 5.1 — Full forward + backward pass for one neuron",
              given: [
                "A single neuron with sigmoid activation",
                "Input $x = 2$, weight $w = 0.5$, bias $b = 0.1$, target $y = 1$, learning rate $\\eta = 0.1$",
                "Sigmoid activation: $a = \\sigma(z) = 1/(1 + e^{-z})$",
              ],
              steps: [
                {
                  label: "STEP 1 — Forward pass: compute z",
                  blocks: [{ type: "formula", tex: "z = wx + b = (0.5)(2) + 0.1 = 1.1" }],
                },
                {
                  label: "STEP 2 — Forward pass: apply the activation",
                  blocks: [{ type: "formula", tex: "a = \\sigma(1.1) = \\frac{1}{1 + e^{-1.1}} = \\frac{1}{1 + 0.3329} \\approx 0.7503" }],
                },
                {
                  label: "STEP 3 — Compute the loss (MSE)",
                  blocks: [{ type: "formula", tex: "L = \\frac{1}{2}(y - a)^2 = 0.5 \\times (1 - 0.7503)^2 = 0.5 \\times (0.2497)^2 \\approx 0.0312" }],
                },
                {
                  label: "STEP 4 — Backward pass: apply the chain rule",
                  blocks: [
                    { type: "text", value: "We need $\\partial L/\\partial w$. The chain rule breaks it into three easy local derivatives:" },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a} \\times \\frac{\\partial a}{\\partial z} \\times \\frac{\\partial z}{\\partial w}" },
                    {
                      type: "bullets",
                      items: [
                        "$\\partial L/\\partial a = -(y - a) = -(1 - 0.7503) = -0.2497$ (derivative of the MSE loss)",
                        "$\\partial a/\\partial z = a(1 - a) = 0.7503 \\times 0.2497 \\approx 0.1874$ (the well-known derivative of the sigmoid function)",
                        "$\\partial z/\\partial w = x = 2$ (since $z = wx + b$)",
                      ],
                    },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial w} = (-0.2497)(0.1874)(2) \\approx -0.0936" },
                  ],
                },
                {
                  label: "STEP 5 — Update the weight (gradient descent)",
                  blocks: [{ type: "formula", tex: "w_{\\text{new}} = w - \\eta\\,\\frac{\\partial L}{\\partial w} = 0.5 - (0.1)(-0.0936) = 0.5094" }],
                },
                {
                  label: "The bias, similarly",
                  blocks: [
                    { type: "text", value: "A similar calculation gives $\\partial L/\\partial b = -0.0468$ (since $\\partial z/\\partial b = 1$), so:" },
                    { type: "formula", tex: "b_{\\text{new}} = 0.1 - (0.1)(-0.0468) = 0.1047" },
                  ],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "The weight moved from 0.5 to 0.5094 — a small step in the direction that would have made $a$ closer to the target $y = 1$. Repeating this **thousands of times, on thousands of examples, is literally what 'training' a network means**.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l5-s5",
          title: "Backpropagation through a convolution layer (concept)",
          blocks: [
            {
              type: "bullets",
              items: [
                "A full symbolic derivation is lengthy, but the result is elegant and worth remembering: **backpropagation through a convolution layer is itself another convolution**.",
                "**Gradient w.r.t. the filter weights** — obtained by convolving the layer's input with the upstream gradient (the error signal flowing back from the next layer).",
                "**Gradient w.r.t. the input** (passed further back) — obtained by convolving the upstream gradient with the **filter rotated by 180°**.",
                "Because of **parameter sharing**, the same filter is used at every spatial position during the forward pass, so its gradient is the **sum of the contributions from every position** it was applied to.",
                "**Pooling layers** have no weights to update; they simply **route the gradient back** to whichever input produced the pooled output — for max pooling, all the gradient goes to the single max element; for average pooling, it is split equally among all elements in the window.",
              ],
            },
          ],
        },
        {
          id: "u2-l5-s6",
          title: "Gradient descent variants",
          blocks: [
            {
              type: "table",
              headers: ["Variant", "Update uses...", "Trade-off"],
              rows: [
                ["Batch Gradient Descent", "The entire training set, per update", "Stable direction, but slow and memory-heavy"],
                ["Stochastic GD (SGD)", "One randomly chosen example, per update", "Very fast updates, but noisy / erratic path"],
                ["Mini-batch Gradient Descent", "A small batch (e.g. 32, 64, 128 examples)", "The practical standard — balances speed and stability"],
              ],
            },
            {
              type: "text",
              value:
                "In practice, mini-batch gradient descent is almost always combined with an **adaptive optimizer** (Momentum, RMSProp, or Adam) that adjusts the effective learning rate per parameter — see the Hyperparameter Optimization lesson.",
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-9",
                  question: "The four steps of the ConvNet training loop, in their correct order, are:",
                  options: [
                    "Loss → forward pass → update → backward pass",
                    "Forward pass → compute loss → backward pass → update weights",
                    "Backward pass → forward pass → loss → update",
                    "Update → forward pass → loss → backward pass",
                  ],
                  correct: 1,
                  explanation:
                    "Push a batch through the network (forward), measure how wrong it is (loss), compute gradients with the chain rule (backward), then nudge the weights (update) — repeated for every mini-batch.",
                },
                {
                  id: "u2-check-10",
                  question: "Because of parameter sharing, the gradient of a convolution filter is:",
                  options: [
                    "Computed only at the top-left position",
                    "The sum of the contributions from every position the filter was applied to",
                    "Always exactly zero",
                    "Divided by the number of positions",
                  ],
                  correct: 1,
                  explanation:
                    "The same filter is used at every spatial position in the forward pass, so during backprop its gradient accumulates the contributions from all of those positions.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l6",
      title: "Weight Initialization",
      subtitle: "Zero init, the symmetry problem, Xavier/Glorot and He — getting the starting point right.",
      minutes: 10,
      sections: [
        {
          id: "u2-l6-s1",
          title: "Why does initialization matter?",
          blocks: [
            {
              type: "bullets",
              items: [
                "Before training starts, every weight must be set to some initial value. This starting point has a **big effect on how well, and how fast, the network learns**.",
                "**Zero initialization is broken — the symmetry problem**: if every weight in a layer starts at exactly 0 (or any other identical constant), every neuron in that layer computes the exact same output and receives the exact same gradient during backprop. They then update identically forever — the layer can never break this symmetry, so it **behaves like a single neuron** no matter how many it actually has.",
                "**Random initialization breaks symmetry**, but the scale of the random numbers still matters enormously: too large and activations/gradients can **explode** layer after layer; too small and they can **vanish** to near-zero in deep networks.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "The symmetry problem — why zero init fails forever",
              blocks: [
                {
                  type: "text",
                  value:
                    "Identical weights → identical outputs → identical gradients → **identical updates, at every single step**. The neurons never differentiate, no matter how long you train. Any random initialization breaks the symmetry.",
                },
              ],
            },
          ],
        },
        {
          id: "u2-l6-s2",
          title: "Xavier / Glorot initialization",
          blocks: [
            {
              type: "text",
              value:
                "Designed for **tanh / sigmoid** activations. The goal is to keep the variance of activations (and gradients) roughly constant as signals pass through layers, so nothing explodes or vanishes.",
            },
            {
              type: "text",
              value:
                "Weights are sampled from a distribution with mean 0 and the following variance, where $n_{\\text{in}}$ is the number of inputs to the layer (fan-in):",
            },
            {
              type: "formula",
              tex: "\\text{Var}(W) = \\frac{1}{n_{\\text{in}}} \\quad\\Rightarrow\\quad \\text{std}(W) = \\sqrt{\\frac{1}{n_{\\text{in}}}}",
              caption: "Xavier / Glorot initialization — for tanh and sigmoid activations",
            },
          ],
        },
        {
          id: "u2-l6-s3",
          title: "He initialization",
          blocks: [
            {
              type: "text",
              value:
                "Designed for **ReLU (and its variants)**. Since ReLU zeroes out roughly half of its inputs on average, He initialization uses **double the variance of Xavier** to compensate, keeping the signal's variance stable across layers:",
            },
            {
              type: "formula",
              tex: "\\text{Var}(W) = \\frac{2}{n_{\\text{in}}} \\quad\\Rightarrow\\quad \\text{std}(W) = \\sqrt{\\frac{2}{n_{\\text{in}}}}",
              caption: "He initialization — for ReLU and its variants",
            },
          ],
        },
        {
          id: "u2-l6-s4",
          title: "Worked example — comparing Xavier and He",
          blocks: [
            { type: "widget", widgetId: "u2-init-lab", title: "Initialization explorer", description: "Compare zero, plain-random, Xavier and He initialization layer by layer — watch activations explode, vanish or stay stable, and read off the exact std-dev for any fan-in." },
            {
              type: "example",
              title: "Example 6.1 — Standard deviation for a layer with 256 inputs",
              given: ["A layer with $n_{\\text{in}} = 256$ incoming connections"],
              steps: [
                {
                  label: "(a) Xavier initialization (use if this layer is followed by tanh / sigmoid)",
                  blocks: [{ type: "formula", tex: "\\text{std}(W) = \\sqrt{\\frac{1}{256}} = \\sqrt{0.003906} = \\frac{1}{16} = 0.0625" }],
                },
                {
                  label: "(b) He initialization (use if this layer is followed by ReLU)",
                  blocks: [{ type: "formula", tex: "\\text{std}(W) = \\sqrt{\\frac{2}{256}} = \\sqrt{0.0078125} \\approx 0.0884" }],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "He initialization gives a std-dev about $\\sqrt{2} \\approx 1.41\\times$ larger than Xavier for the same layer. Using the wrong one is not fatal, but using Xavier with ReLU tends to make activations shrink toward zero over many layers, slowing training — **matching the initializer to the activation function measurably helps deep networks converge**.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l6-s5",
          title: "Quick comparison",
          blocks: [
            {
              type: "table",
              headers: ["Method", "Formula (std-dev)", "Best paired with", "Problem it solves"],
              rows: [
                ["Zero init", "std = 0", "Never — always broken", "N/A (causes the symmetry problem)"],
                ["Plain random (unscaled)", "e.g. std = 1 (fixed)", "Not recommended", "Breaks symmetry, but scale is untuned"],
                ["Xavier / Glorot", "$\\sqrt{1/n_{\\text{in}}}$", "tanh, sigmoid", "Keeps variance stable for S-shaped activations"],
                ["He", "$\\sqrt{2/n_{\\text{in}}}$", "ReLU, Leaky ReLU", "Compensates for ReLU zeroing ≈half the units"],
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-11",
                  question: "Initializing every weight in a layer to the same constant (e.g. 0) fails because:",
                  options: [
                    "It causes exploding gradients",
                    "Of the symmetry problem — all neurons compute identical outputs and receive identical gradients forever",
                    "The loss becomes undefined",
                    "It makes ReLU inactive everywhere",
                  ],
                  correct: 1,
                  explanation:
                    "Identical weights mean identical outputs and identical gradients, so the neurons update identically forever — the layer behaves like a single neuron, however many it actually contains.",
                },
                {
                  id: "u2-check-12",
                  question: "For a layer with 256 inputs, He initialization samples weights with a standard deviation of about:",
                  options: ["0.0625", "0.0884", "0.1250", "0.5000"],
                  correct: 1,
                  explanation:
                    "std = √(2/256) ≈ 0.0884. (0.0625 = √(1/256) is Xavier's value for the same layer — Example 6.1.)",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l7",
      title: "Batch Normalization",
      subtitle: "Internal covariate shift, the four-step algorithm, and what happens at test time.",
      minutes: 12,
      sections: [
        {
          id: "u2-l7-s1",
          title: "Why batch normalization?",
          blocks: [
            {
              type: "text",
              value:
                "**Internal covariate shift**: as training progresses, the parameters of every earlier layer keep changing, so the distribution of inputs reaching each later layer keeps shifting too. Each layer is constantly having to re-adapt to a **moving target**, which slows training and forces the use of small, cautious learning rates.",
            },
            {
              type: "text",
              value:
                "**Batch Normalization (BN)** normalizes a layer's activations, across the current mini-batch, to **zero mean and unit variance**, and then lets the network learn its own best scale and shift for them.",
            },
            {
              type: "callout",
              variant: "tip",
              title: "Extra benefits of BN",
              blocks: [
                {
                  type: "bullets",
                  items: [
                    "Allows noticeably **higher learning rates**.",
                    "Reduces sensitivity to the exact **weight initialization** used.",
                    "Acts as a **mild regularizer** (the mini-batch statistics add a small amount of noise).",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l7-s2",
          title: "The four steps of batch normalization",
          blocks: [
            { type: "text", value: "BN is applied independently to each channel / feature, using the statistics of the current mini-batch of $m$ examples:" },
            {
              type: "formula",
              tex: "\\mu = \\frac{1}{m}\\sum_{i=1}^{m} x_i",
              caption: "Step 1 — Compute the mini-batch mean (over the m examples in the batch)",
            },
            {
              type: "formula",
              tex: "\\sigma^2 = \\frac{1}{m}\\sum_{i=1}^{m} (x_i - \\mu)^2",
              caption: "Step 2 — Compute the mini-batch variance",
            },
            {
              type: "formula",
              tex: "z_i = \\frac{x_i - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}}",
              caption: "Step 3 — Normalize (ε is a tiny constant, e.g. 1e-8, added only to avoid dividing by zero)",
            },
            {
              type: "formula",
              tex: "y_i = \\gamma z_i + \\beta",
              caption: "Step 4 — Scale and shift using two learnable parameters γ and β (so the network can undo the normalization if that turns out to be optimal)",
            },
          ],
        },
        {
          id: "u2-l7-s3",
          title: "Worked numerical example",
          blocks: [
            { type: "widget", widgetId: "u2-batchnorm-lab", title: "Batch normalization lab", description: "Feed your own mini-batch through the four BN steps of Example 7.1 — mean, variance, normalize, scale & shift — and watch the distribution settle to mean 0, variance 1 before γ and β reshape it." },
            {
              type: "example",
              title: "Example 7.1 — Batch-normalize four activation values",
              given: [
                "A mini-batch of 4 activations $x = [2, 4, 6, 8]$",
                "Learnable $\\gamma = 2$, $\\beta = 1$ (ignore $\\epsilon$ — it is negligible here)",
              ],
              steps: [
                {
                  label: "Step 1 — Mean",
                  blocks: [{ type: "formula", tex: "\\mu = \\frac{2+4+6+8}{4} = \\frac{20}{4} = 5" }],
                },
                {
                  label: "Step 2 — Variance",
                  blocks: [{ type: "formula", tex: "\\sigma^2 = \\frac{(2-5)^2 + (4-5)^2 + (6-5)^2 + (8-5)^2}{4} = \\frac{9+1+1+9}{4} = \\frac{20}{4} = 5" }],
                },
                {
                  label: "Step 3 — Normalize each value (divide by √5 ≈ 2.2361)",
                  blocks: [
                    { type: "formula", tex: "z_1 = \\frac{2-5}{2.2361} \\approx -1.3416 \\qquad z_2 = \\frac{4-5}{2.2361} \\approx -0.4472" },
                    { type: "formula", tex: "z_3 = \\frac{6-5}{2.2361} \\approx 0.4472 \\qquad z_4 = \\frac{8-5}{2.2361} \\approx 1.3416" },
                  ],
                },
                {
                  label: "Step 4 — Scale (×2) and shift (+1)",
                  blocks: [
                    { type: "formula", tex: "y_1 = 2(-1.3416) + 1 \\approx -1.6833 \\qquad y_2 = 2(-0.4472) + 1 \\approx 0.1056" },
                    { type: "formula", tex: "y_3 = 2(0.4472) + 1 \\approx 1.8944 \\qquad y_4 = 2(1.3416) + 1 \\approx 3.6833" },
                  ],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "Notice the normalized values $z$ have **mean 0 and variance 1 by construction** — BN guarantees this for every layer, every mini-batch, regardless of what came before. The learned $\\gamma, \\beta$ then let the network re-scale this standardized signal to whatever range works best.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l7-s4",
          title: "Batch normalization at test / inference time",
          blocks: [
            {
              type: "bullets",
              items: [
                "At test time we may be predicting on a **single example** — there is no 'batch' to compute a mean and variance from.",
                "**Solution**: during training, BN keeps a **running (moving) average** of the mean and variance seen across all mini-batches. At test time, this fixed running average is used instead of a fresh batch statistic — so inference is **deterministic** and works even for a single input.",
              ],
            },
          ],
        },
        {
          id: "u2-l7-s5",
          title: "Where does BN go in the layer stack?",
          blocks: [
            {
              type: "bullets",
              items: [
                "The standard placement (from the original paper) is: **Convolution → Batch Norm → ReLU** — normalize the raw linear output before the non-linearity is applied.",
                "Because BN re-centres the output anyway, the convolution's **bias term becomes redundant** and is usually dropped when BN is used.",
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-13",
                  question: "The learnable parameters of a batch normalization layer are:",
                  options: ["μ and σ²", "γ and β", "The running mean and variance", "ε and m"],
                  correct: 1,
                  explanation:
                    "γ (scale) and β (shift) are learned by gradient descent; the running mean/variance are tracked statistics, and ε is a fixed tiny constant.",
                },
                {
                  id: "u2-check-14",
                  question: "When batch normalization is placed right after a convolution layer, the convolution's bias term:",
                  options: [
                    "Must be doubled",
                    "Becomes redundant and is usually dropped",
                    "Is learned twice as fast",
                    "Replaces the β parameter",
                  ],
                  correct: 1,
                  explanation:
                    "BN re-centres the output anyway (β can absorb any shift), so the conv bias adds nothing — it is normally omitted in Conv→BN→ReLU stacks.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l8",
      title: "Dropout",
      subtitle: "Randomly switching neurons off to prevent co-adaptation — and the inverted scaling trick.",
      minutes: 10,
      sections: [
        {
          id: "u2-l8-s1",
          title: "The overfitting problem",
          blocks: [
            {
              type: "bullets",
              items: [
                "Large networks with many parameters can end up **memorising the training data** instead of learning patterns that generalise — especially when training data is limited. This is called **overfitting**.",
                "**Dropout** is a simple and remarkably effective way to fight overfitting.",
              ],
            },
          ],
        },
        {
          id: "u2-l8-s2",
          title: "How dropout works",
          blocks: [
            {
              type: "bullets",
              items: [
                "During training, each neuron in the layer(s) where dropout is applied is **temporarily switched off** (its output forced to 0) with **probability p**, independently, on every forward pass.",
                "A **different random subset is dropped each time**. This stops neurons from **co-adapting** (relying too heavily on one specific other neuron always being present), forcing each neuron to learn features that are useful in many different random combinations.",
                "Dropout can be viewed as implicitly training a **huge number of different 'thinned' sub-networks simultaneously**, all sharing the same weights, and then approximately **averaging them at test time**.",
              ],
            },
          ],
        },
        {
          id: "u2-l8-s3",
          title: "Inverted dropout — the scaling trick",
          blocks: [
            {
              type: "bullets",
              items: [
                "If we simply zero out a fraction $p$ of the neurons during training, the total signal reaching the next layer **shrinks**. But at test time we want to use the full network (no dropping) — which would suddenly produce a **larger** total signal than the next layer ever saw during training. This mismatch would hurt accuracy.",
                "**Inverted dropout fixes this**: during training, the surviving activations are **scaled up by $1/(1-p)$** (i.e. divided by the keep-probability) immediately after masking. This keeps the expected total signal the same as it will be at test time — so **at test time, nothing needs to change at all**; the full network is simply used as-is.",
              ],
            },
          ],
        },
        {
          id: "u2-l8-s4",
          title: "Worked example",
          blocks: [
            { type: "widget", widgetId: "u2-dropout-lab", title: "Dropout simulator", description: "Set the dropout rate, roll a random mask and watch the surviving activations get scaled by 1/(1−p) exactly as in Example 8.1 — then compare with test-time behaviour." },
            {
              type: "example",
              title: "Example 8.1 — Applying inverted dropout",
              given: [
                "5 neuron activations $[0.5, 0.8, 0.3, 0.9, 0.6]$",
                "Dropout rate $p = 0.4$ (so keep-probability $= 1 - p = 0.6$)",
                "Suppose the random mask happens to drop neurons 2 and 5",
              ],
              steps: [
                {
                  label: "Step 1 — Apply the binary mask [1, 0, 1, 1, 0] (multiply element-wise)",
                  blocks: [{ type: "formula", tex: "[0.5 \\times 1,\\; 0.8 \\times 0,\\; 0.3 \\times 1,\\; 0.9 \\times 1,\\; 0.6 \\times 0] = [0.5,\\; 0,\\; 0.3,\\; 0.9,\\; 0]" }],
                },
                {
                  label: "Step 2 — Scale the surviving values by 1/(1−p) = 1/0.6 ≈ 1.667",
                  blocks: [{ type: "formula", tex: "[0.5 \\times 1.667,\\; 0,\\; 0.3 \\times 1.667,\\; 0.9 \\times 1.667,\\; 0] = [0.833,\\; 0,\\; 0.500,\\; 1.500,\\; 0]" }],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "At test time, all 5 neurons are used with **no dropping and no scaling at all** — the scaling was already 'baked in' during training. This is exactly why the technique is called **inverted** dropout: the original formulation instead scaled activations down at test time, which was less convenient for deployment.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l8-s5",
          title: "Where and how to use dropout",
          blocks: [
            {
              type: "bullets",
              items: [
                "Most commonly applied to **fully connected layers**, which hold the majority of a CNN's parameters and are most prone to overfitting.",
                "Used more sparingly (or skipped) in **convolution layers**, since weight sharing already gives conv layers far fewer parameters.",
                "Typical rates: **p ≈ 0.5 for FC layers**; **p ≈ 0.1–0.25 for conv layers**, if used at all.",
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Never at test time",
              blocks: [
                {
                  type: "text",
                  value:
                    "Dropout is **never active at test / inference time** — the complete, un-thinned network is always used for predictions.",
                },
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-15",
                  question: "At test / inference time, dropout is:",
                  options: [
                    "Applied with the same rate p",
                    "Applied with half the rate",
                    "Not applied at all — the full, un-thinned network is used",
                    "Applied only to convolution layers",
                  ],
                  correct: 2,
                  explanation:
                    "Dropout is a training-time-only technique; at test time the complete network is always used, with no dropping and (for inverted dropout) no scaling.",
                },
                {
                  id: "u2-check-16",
                  question: "A typical dropout rate for fully-connected layers is:",
                  options: ["p ≈ 0.01", "p ≈ 0.5", "p ≈ 0.9", "p = 0"],
                  correct: 1,
                  explanation:
                    "FC layers, which hold most of a CNN's parameters, typically use p ≈ 0.5; conv layers use much smaller rates (p ≈ 0.1–0.25) if dropout is used at all.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l9",
      title: "Hyperparameter Optimization",
      subtitle: "Parameters vs hyperparameters, search strategies, learning-rate schedules and early stopping.",
      minutes: 11,
      sections: [
        {
          id: "u2-l9-s1",
          title: "What is a hyperparameter?",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Hyperparameters** are settings chosen **before training begins** — learning rate, batch size, number of layers, filter size, dropout rate, and so on. They are **not learned by gradient descent**.",
                "This is different from **parameters** (the filter weights and biases), which are learned automatically from data during training.",
                "Good hyperparameters can be the difference between a model that trains beautifully and one that **never converges at all** — tuning them is a core part of applied deep learning.",
              ],
            },
          ],
        },
        {
          id: "u2-l9-s2",
          title: "Common CNN hyperparameters",
          blocks: [
            {
              type: "table",
              headers: ["Hyperparameter", "Typical values", "Effect"],
              rows: [
                ["Learning rate (η)", "1e-5 to 1e-1 (often start at 1e-3)", "Step size; too high diverges, too low is very slow"],
                ["Batch size", "16, 32, 64, 128, 256", "Trade-off: gradient stability/memory vs. update speed"],
                ["Number of epochs", "Chosen via early stopping", "How many full passes over the training data"],
                ["Network depth", "Varies by architecture", "More capacity, but harder to optimize / needs more data"],
                ["Filter size", "3×3, 5×5, 7×7", "Larger = bigger receptive field per layer, more params"],
                ["Filters per layer", "32, 64, 128, 256, 512 …", "More filters = richer features, more compute"],
                ["Stride", "1 or 2 (usually)", "Controls how aggressively the map is downsampled"],
                ["Dropout rate p", "0.2 – 0.5", "Regularization strength"],
                ["Weight decay (L2)", "1e-5 to 1e-3", "Regularization strength (penalizes large weights)"],
                ["Optimizer", "SGD, Momentum, RMSProp, Adam", "Affects convergence speed and stability"],
              ],
            },
          ],
        },
        {
          id: "u2-l9-s3",
          title: "Hyperparameter search strategies",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Manual search** — expert intuition and trial-and-error. Cheap per trial but does not scale and is easy to bias.",
                "**Grid Search** — pick a discrete set of values for each hyperparameter and try every combination exhaustively. Simple, but suffers badly from the **'curse of dimensionality'** (see Example 9.1).",
                "**Random Search** — sample combinations randomly from specified ranges. Often more efficient than grid search in practice, because usually only a few hyperparameters actually matter much, and random sampling explores each dimension more thoroughly for the same budget.",
                "**Bayesian Optimization** — builds a probabilistic model of how hyperparameters affect validation performance, and uses it to intelligently pick the next combination to try — balancing exploring uncertain regions against exploiting regions already known to work well. Much more sample-efficient when each training run is expensive.",
              ],
            },
            {
              type: "example",
              title: "Example 9.1 — Why grid search doesn't scale",
              given: [
                "A search over 4 learning rates × 3 batch sizes × 3 dropout rates × 2 optimizers",
                "Each full training run takes 2 hours",
              ],
              steps: [
                {
                  label: "Step 1 — Total combinations (grid search tries all of them)",
                  blocks: [{ type: "formula", tex: "4 \\times 3 \\times 3 \\times 2 = 72 \\text{ combinations}" }],
                },
                {
                  label: "Step 2 — Total compute time",
                  blocks: [{ type: "formula", tex: "72 \\times 2 \\text{ hours} = 144 \\text{ hours} \\;(6 \\text{ full days, on one machine})" }],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "Adding just one more hyperparameter with 3 values would multiply this by 3 again (**432 hours**). This explosive growth — the **curse of dimensionality** — is exactly why random search or Bayesian optimization is preferred once the search space grows beyond 2–3 hyperparameters.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u2-l9-s4",
          title: "Learning rate — the single most important hyperparameter",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Too high**: the loss oscillates wildly or diverges outright — each update overshoots the minimum.",
                "**Too low**: training crawls, and optimization can get stuck in poor regions of the loss surface.",
                "**Learning-rate scheduling** is standard practice: start with a larger learning rate for fast early progress, then decrease it over time (**step decay, exponential decay, or cosine annealing**) so training fine-tunes precisely as it approaches a good solution.",
              ],
            },
          ],
        },
        {
          id: "u2-l9-s5",
          title: "Early stopping and cross-validation",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Early stopping** — monitor the validation loss during training and stop once it stops improving (even if the training loss keeps falling). This is effectively **free regularization** and doubles as a way of choosing 'number of epochs' automatically.",
                "**k-fold cross-validation** — for smaller datasets, split the data into $k$ folds, train $k$ times (holding out a different fold each time for validation), and average the results. Gives a far more reliable estimate of how a hyperparameter choice will generalize, at roughly $k\\times$ the compute cost.",
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-17",
                  question: "Which of the following is a hyperparameter rather than a parameter?",
                  options: ["A convolution filter's weights", "The biases of a dense layer", "The learning rate", "The batch-normalization parameters γ and β"],
                  correct: 2,
                  explanation:
                    "Hyperparameters are chosen before training and are not learned by gradient descent; filter weights, biases, γ and β are all parameters learned automatically from data.",
                },
                {
                  id: "u2-check-18",
                  question: "Random search often beats grid search for the same compute budget because:",
                  options: [
                    "It never misses the optimum",
                    "Usually only a few hyperparameters matter much, and random sampling explores each dimension more thoroughly",
                    "It trains each model faster",
                    "It requires no validation set",
                  ],
                  correct: 1,
                  explanation:
                    "Grid search wastes trials re-testing irrelevant dimensions; random sampling spreads its budget across the full range of every dimension, so the few hyperparameters that matter get explored well.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u2-l10",
      title: "CNN Architectures — AlexNet to ResNet",
      subtitle: "AlexNet, VGG, GoogLeNet and ResNet — the four designs that shaped modern computer vision.",
      minutes: 18,
      sections: [
        {
          id: "u2-l10-s1",
          title: "Overview — four milestones",
          blocks: [
            {
              type: "text",
              value:
                "Four architectures mark the key milestones in the evolution of modern CNN design. Each one introduced at least one idea that is still used in virtually every network built today.",
            },
            { type: "widget", widgetId: "u2-arch-gallery", title: "Architecture gallery", description: "Browse AlexNet, VGG16, GoogLeNet and ResNet side by side — depth, parameter counts, headline ideas and the exact numbers from this unit." },
            {
              type: "table",
              headers: ["Architecture", "Year", "Headline Idea"],
              rows: [
                ["AlexNet", "2012", "Proved deep CNNs + GPU training work at scale"],
                ["VGG", "2014", "Depth with small, uniform 3×3 filters"],
                ["GoogLeNet (Inception)", "2014", "Multi-scale Inception module + 1×1 bottlenecks"],
                ["ResNet", "2015", "Residual / skip connections enable extreme depth"],
              ],
            },
          ],
        },
        {
          id: "u2-l10-s2",
          title: "AlexNet (2012)",
          blocks: [
            {
              type: "text",
              value:
                "**Krizhevsky, Sutskever and Hinton's AlexNet** won ILSVRC-2012 (the ImageNet competition) by a huge margin, and is widely credited with **igniting the modern deep-learning revolution** in computer vision. Key firsts introduced / popularised:",
            },
            {
              type: "bullets",
              items: [
                "**ReLU activation** instead of tanh/sigmoid — trains dramatically faster.",
                "Trained across **2 GPUs in parallel** — an early proof that GPU compute is essential at this scale.",
                "**Dropout in the FC layers** to fight overfitting.",
                "**Data augmentation** (random crops, horizontal flips) to artificially enlarge the training set.",
                "**Overlapping max pooling** (pooling stride smaller than the pooling window).",
              ],
            },
            {
              type: "table",
              headers: ["Depth", "Parameters", "ImageNet Top-5 Error"],
              rows: [["8 learned layers (5 conv + 3 FC)", "≈ 60 million", "15.3% (next-best that year: ≈ 26.2%)"]],
              caption: "AlexNet — 5 convolution layers followed by 3 fully-connected layers",
            },
          ],
        },
        {
          id: "u2-l10-s3",
          title: "VGGNet (2014)",
          blocks: [
            {
              type: "text",
              value:
                "**Simonyan and Zisserman** (Oxford's Visual Geometry Group, hence 'VGG') showed that **depth alone, built from very small filters**, could push accuracy much further.",
            },
            {
              type: "bullets",
              items: [
                "**Central design rule**: use only 3×3 convolutions (stride 1, pad 1) and 2×2 max pooling (stride 2), stacked many layers deep.",
                "As shown in Example 3.3, three stacked 3×3 convs match the receptive field of one 7×7 conv with **far fewer parameters and extra non-linearity** — this is precisely VGG's design philosophy applied throughout the whole network.",
                "**VGG16** (13 conv + 3 FC = 16 weight layers) and **VGG19** (19 weight layers) are the common variants — five blocks of small 3×3 convolutions, each followed by 2×2 max pooling.",
              ],
            },
            {
              type: "table",
              headers: ["Depth", "Parameters", "ImageNet Top-5 Error"],
              rows: [["16 weight layers", "≈ 138 million (mostly in the FC layers — recall Example 4.2)", "≈ 7.3%"]],
              caption: "VGG16 at a glance",
            },
            {
              type: "callout",
              variant: "key",
              title: "The downside of VGG",
              blocks: [
                {
                  type: "text",
                  value:
                    "VGG is large and slow, mainly because of its **huge fully-connected layers** — exactly the inefficiency that GoogLeNet and ResNet were designed to fix.",
                },
              ],
            },
          ],
        },
        {
          id: "u2-l10-s4",
          title: "GoogLeNet / Inception (2014)",
          blocks: [
            {
              type: "text",
              value:
                "**Szegedy et al. (Google)** won ILSVRC-2014 with a radically different idea: instead of picking one filter size per layer, **run several filter sizes in parallel on the same input and let the network combine them** — the Inception module (1×1, 3×3, 5×5 and pooling branches, concatenated).",
            },
            {
              type: "bullets",
              items: [
                "**1×1 bottleneck convolutions** shrink the channel depth before the expensive 3×3 / 5×5 convolutions run — this single trick is what keeps Inception affordable (see Example 10.1).",
                "**22 layers deep, yet only ≈ 5 million parameters** — far fewer than AlexNet (60M) or VGG (138M) despite being much deeper, thanks to the 1×1 bottlenecks and to replacing the huge final FC stack with **Global Average Pooling** (Example 4.2).",
                "Uses **auxiliary classifiers** — small extra classifier heads attached partway through the network, used only during training to inject additional gradient signal into early layers (removed at inference).",
              ],
            },
            {
              type: "example",
              title: "Example 10.1 — Why the 1×1 bottleneck matters",
              given: ["Input volume 28×28×192", "We want a 5×5 convolution producing 32 output channels"],
              steps: [
                {
                  label: "Option A — Direct 5×5 convolution (no bottleneck)",
                  blocks: [{ type: "formula", tex: "\\text{Params} = 5 \\times 5 \\times 192 \\times 32 = 153{,}600" }],
                },
                {
                  label: "Option B — 1×1 bottleneck (192→16 channels), then 5×5 convolution (16→32 channels)",
                  blocks: [
                    { type: "formula", tex: "1 \\times 1 \\text{ conv: } 1 \\times 1 \\times 192 \\times 16 = 3{,}072" },
                    { type: "formula", tex: "5 \\times 5 \\text{ conv: } 5 \\times 5 \\times 16 \\times 32 = 12{,}800" },
                    { type: "formula", tex: "\\text{Total} = 3{,}072 + 12{,}800 = 15{,}872" },
                  ],
                },
                {
                  label: "Compare",
                  blocks: [{ type: "formula", tex: "153{,}600 \\div 15{,}872 \\approx 9.7" }],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "The bottleneck design uses roughly **10× fewer parameters (a ≈90% reduction)** for essentially the same convolution — this is what lets Inception be simultaneously **deeper and dramatically smaller than VGG**.",
                    },
                  ],
                },
              ],
            },
            {
              type: "table",
              headers: ["Depth", "Parameters", "ImageNet Top-5 Error"],
              rows: [["22 layers", "≈ 5 million", "≈ 6.7%"]],
              caption: "GoogLeNet at a glance",
            },
          ],
        },
        {
          id: "u2-l10-s5",
          title: "ResNet (2015)",
          blocks: [
            {
              type: "text",
              value:
                "**He, Zhang, Ren and Sun (Microsoft Research)** won ILSVRC-2015 with a top-5 error of **3.57%** — surpassing the commonly-cited **human-level benchmark (≈5%)** on this task.",
            },
            {
              type: "bullets",
              items: [
                "**The problem it solves — degradation**: past a certain depth, plain (non-residual) networks get **worse** with more layers — not from overfitting, but because they become genuinely **harder to optimize** (vanishing / exploding gradients through so many stacked layers).",
                "**Central idea — residual (skip) connections**: instead of a block learning the full mapping $H(x)$ directly, it learns only the **residual** $F(x) = H(x) - x$, and the block outputs $F(x) + x$ by adding the untouched input back in via a shortcut that bypasses the block.",
              ],
            },
            {
              type: "formula",
              tex: "F(x) = H(x) - x \\qquad \\text{block output} = F(x) + x",
              caption: "Residual learning — the block only learns the residual; the identity shortcut carries x through untouched",
            },
            {
              type: "bullets",
              items: [
                "**Why it works**: the addition operation has a **local gradient of exactly 1** along the shortcut path, so gradients can flow all the way back to early layers **without shrinking** — this keeps even extremely deep networks (50, 101, 152, and beyond) trainable.",
                "**Bottleneck blocks**: deeper variants (ResNet-50/101/152) use a **1×1 → 3×3 → 1×1** bottleneck inside each residual block — the same channel-reduction trick as Inception's 1×1 convolutions — to keep compute manageable at such extreme depth.",
                "**Common variants**: ResNet-18 / 34 (basic 2-layer blocks) and ResNet-50 / 101 / 152 (3-layer bottleneck blocks). ResNet-50 has ≈ 25.6 million parameters.",
              ],
            },
            {
              type: "table",
              headers: ["Depth", "Parameters", "ImageNet Top-5 Error"],
              rows: [["Up to 152 layers (ResNet-152)", "≈ 60 million (ResNet-152)", "3.57%"]],
              caption: "ResNet at a glance — a residual block lets gradients skip straight past the two weight layers",
            },
          ],
        },
        {
          id: "u2-l10-s6",
          title: "Side-by-side comparison — and how the ideas build on each other",
          blocks: [
            {
              type: "table",
              headers: ["Architecture", "Year", "Depth", "Parameters", "Top-5 Error", "Key Innovation"],
              rows: [
                ["AlexNet", "2012", "8 layers", "≈ 60M", "15.3%", "ReLU, Dropout, GPU training"],
                ["VGG-16", "2014", "16 layers", "≈ 138M", "≈ 7.3%", "Deep stack of small 3×3 filters"],
                ["GoogLeNet", "2014", "22 layers", "≈ 5M", "≈ 6.7%", "Inception module + 1×1 bottlenecks"],
                ["ResNet-152", "2015", "152 layers", "≈ 60M", "3.57%", "Residual / skip connections"],
              ],
            },
            { type: "heading", value: "The big picture — how these ideas build on each other" },
            {
              type: "bullets",
              items: [
                "**AlexNet** proved that deep CNNs trained on GPUs could dramatically beat traditional computer-vision methods.",
                "**VGG** proved that going deeper, using small and uniform filters, reliably improves accuracy — and that simple, regular designs transfer well to new tasks.",
                "**GoogLeNet** proved that clever, efficient module design (multi-scale filters + 1×1 bottlenecks) can beat brute-force scaling — more accurate than VGG with roughly **27× fewer parameters**.",
                "**ResNet** proved that residual connections solve the degradation problem, finally unlocking truly deep networks (100+ layers) as practical and trainable — an idea now used almost everywhere in deep learning, well beyond CNNs (e.g. Transformers).",
              ],
            },
          ],
        },
        {
          id: "u2-l10-s7",
          title: "Quick revision — every formula and fact at a glance",
          blocks: [
            { type: "text", value: "A condensed, exam-ready reference covering every formula and concept from this unit." },
            {
              type: "table",
              headers: ["Concept", "Formula"],
              rows: [
                ["Conv / Pool output size", "$O = \\lfloor (N + 2P - F)/S \\rfloor + 1$"],
                ["Convolution layer parameters", "$(F \\times F \\times C_{\\text{in}} + 1) \\times K$ (K = number of filters)"],
                ["'Same' padding (stride 1)", "$P = (F - 1)/2$"],
                ["Receptive field growth (stride 1)", "$RF_{\\text{out}} = RF_{\\text{in}} + (F - 1)$"],
                ["Xavier / Glorot init (tanh, sigmoid)", "$\\text{std}(W) = \\sqrt{1/n_{\\text{in}}}$"],
                ["He init (ReLU)", "$\\text{std}(W) = \\sqrt{2/n_{\\text{in}}}$"],
                ["Batch norm — normalize", "$z_i = (x_i - \\mu)/\\sqrt{\\sigma^2 + \\epsilon}$"],
                ["Batch norm — scale & shift", "$y_i = \\gamma z_i + \\beta$"],
                ["Inverted dropout scaling", "activation $\\div (1 - p)$, applied during training only"],
                ["Gradient descent update", "$w \\leftarrow w - \\eta\\, \\partial L/\\partial w$"],
              ],
              caption: "Key formulas at a glance",
            },
            {
              type: "table",
              headers: ["Layer", "Learnable parameters?", "Notes"],
              rows: [
                ["Convolution", "Yes — filter weights + bias", "Weights are shared across every spatial position"],
                ["Pooling (Max / Average)", "No", "A fixed mathematical operation, nothing to learn"],
                ["Batch Normalization", "Yes — γ and β", "Running mean / variance are tracked but not learned by gradient descent"],
                ["Dropout", "No", "Just applies a random binary mask at train time"],
                ["Fully Connected (Dense)", "Yes — weights + bias", "Every input unit connects to every output unit"],
              ],
              caption: "Which layers have learnable parameters?",
            },
            { type: "heading", value: "Quick glossary" },
            {
              type: "bullets",
              items: [
                "**Feature map** — the output produced by convolving one filter over the input.",
                "**Receptive field** — the region of the original input that influences a given output value.",
                "**Stride** — the number of pixels the filter moves between applications.",
                "**Padding** — extra border pixels (usually zeros) added around the input.",
                "**Epoch** — one full pass of the training algorithm over the entire training dataset.",
                "**Overfitting** — a model that fits the training data very well but generalizes poorly to new data.",
                "**Regularization** — any technique (dropout, weight decay, data augmentation, …) used to reduce overfitting.",
                "**Backpropagation** — the chain-rule algorithm used to compute ∂L/∂w for every weight in the network.",
                "**Logits** — the raw, un-normalized output scores of the final layer, before softmax.",
                "**Global Average Pooling (GAP)** — pools an entire feature map down to a single number per channel; commonly replaces large FC stacks.",
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u2-check-19",
                  question: "The degradation problem, solved by ResNet, refers to the observation that plain (non-residual) networks:",
                  options: [
                    "Overfit more as depth increases",
                    "Get worse — even on training data — as depth increases, because they become harder to optimize",
                    "Cannot use ReLU activations",
                    "Lose spatial information in deep layers",
                  ],
                  correct: 1,
                  explanation:
                    "Past a certain depth, training error itself rises in plain networks — an optimization problem (vanishing/exploding gradients), not overfitting.",
                },
                {
                  id: "u2-check-20",
                  question: "Inside a residual block, the identity shortcut helps backpropagation because:",
                  options: [
                    "It doubles the effective learning rate",
                    "The addition along the shortcut has a local gradient of exactly 1, so gradients reach early layers unshrunk",
                    "It removes the need for the 3×3 convolutions",
                    "It applies dropout to the gradients",
                  ],
                  correct: 1,
                  explanation:
                    "The '+x' path passes gradients straight through with derivative exactly 1, giving every layer a direct, unimpeded route back to the loss — keeping even 152-layer networks trainable.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  quiz: [
    {
      id: "u2-q1",
      question: "What is the primary reason a convolution layer needs far fewer parameters than a fully-connected layer on the same image?",
      options: [
        "It uses fewer layers overall",
        "Weight sharing and local connectivity — the same small filter is reused at every position",
        "It only works on grayscale images",
        "It does not use any activation function",
      ],
      correct: 1,
      explanation:
        "Local connectivity means each neuron only looks at a small patch, and parameter sharing means the same filter weights are reused across every position — see Example 1.1 (≈4000× fewer parameters).",
    },
    {
      id: "u2-q2",
      question: "An input of size 7×7 is convolved with a 3×3 filter, stride 1, no padding. What is the output size?",
      options: ["3×3", "4×4", "5×5", "6×6"],
      correct: 2,
      explanation: "O = (N−F)/S + 1 = (7−3)/1 + 1 = 5, so the output is 5×5.",
    },
    {
      id: "u2-q3",
      question: "What is a 'feature map' in a CNN?",
      options: [
        "The raw input image",
        "The learnable filter itself",
        "The output produced by convolving one filter over the input",
        "The final softmax probability vector",
      ],
      correct: 2,
      explanation:
        "A feature map (activation map) is the 2-D result of sliding one specific filter across the input; a layer with K filters produces K feature maps.",
    },
    {
      id: "u2-q4",
      question: "For 'same' padding with stride 1 and a filter size F = 5, what padding P is required?",
      options: ["P = 1", "P = 2", "P = 3", "P = 4"],
      correct: 1,
      explanation: "P = (F−1)/2 = (5−1)/2 = 2.",
    },
    {
      id: "u2-q5",
      question: "N = 11, F = 3, S = 2, P = 0. What is the output size?",
      options: ["4", "5", "6", "7"],
      correct: 1,
      explanation: "O = ⌊(N−F)/S⌋ + 1 = ⌊(11−3)/2⌋ + 1 = 4 + 1 = 5.",
    },
    {
      id: "u2-q6",
      question: "Which statement about pooling layers is TRUE?",
      options: [
        "Pooling layers have learnable weights, just like conv layers",
        "Max pooling must always use stride 1",
        "Pooling layers have no learnable parameters at all",
        "Average pooling cannot be used as the final layer of a CNN",
      ],
      correct: 2,
      explanation:
        "Pooling is a fixed mathematical operation (max or mean) — it has no weights or biases to learn. Global Average Pooling is, in fact, commonly used as the final layer in modern architectures.",
    },
    {
      id: "u2-q7",
      question: "A 2×2 max-pooling window contains the values {3, 7, 2, 5}. What value does it output?",
      options: ["2", "3", "5", "7"],
      correct: 3,
      explanation: "Max pooling outputs the largest value in the window: max(3, 7, 2, 5) = 7.",
    },
    {
      id: "u2-q8",
      question: "Backpropagation computes gradients efficiently by repeatedly applying which mathematical rule?",
      options: ["The product rule", "The chain rule", "The quotient rule", "L'Hopital's rule"],
      correct: 1,
      explanation:
        "Backprop decomposes ∂L/∂w (for a weight buried deep in the network) into a product of simple local derivatives via the chain rule, working backward from the output.",
    },
    {
      id: "u2-q9",
      question: "Initializing every weight in a network to exactly zero causes which problem?",
      options: [
        "Vanishing gradients only, nothing else",
        "Exploding gradients",
        "The symmetry problem — every neuron in a layer updates identically forever",
        "Overfitting",
      ],
      correct: 2,
      explanation:
        "With identical weights, every neuron in a layer computes the same output and receives the same gradient, so they never differentiate from one another — the layer can never use its full capacity.",
    },
    {
      id: "u2-q10",
      question: "He initialization sets the variance of the weights to:",
      options: ["$1/n_{\\text{in}}$", "$2/n_{\\text{in}}$", "$1/(n_{\\text{in}} + n_{\\text{out}})$", "$n_{\\text{in}}/2$"],
      correct: 1,
      explanation:
        "He init uses Var(W) = 2/n_in — double Xavier's variance — to compensate for ReLU zeroing out roughly half its inputs on average.",
    },
    {
      id: "u2-q11",
      question: "Immediately after the 'normalize' step of Batch Normalization (before scale-and-shift), the batch of values has:",
      options: ["Mean = 1, Variance = 0", "Mean = 0, Variance = 1", "Mean = 0, Variance = 0", "It depends on γ and β"],
      correct: 1,
      explanation:
        "Step 3 of BN (z_i = (x_i−μ)/√(σ²+ε)) is defined precisely so the normalized values have mean 0 and variance 1, by construction, before γ and β are applied in Step 4.",
    },
    {
      id: "u2-q12",
      question: "In inverted dropout, the surviving (non-dropped) activations are scaled, during training, by a factor of:",
      options: ["p", "1 − p", "1 / (1 − p)", "1 / p"],
      correct: 2,
      explanation:
        "Surviving activations are divided by the keep-probability (1−p), i.e. multiplied by 1/(1−p), so the expected total signal matches what the next layer will see at test time (when nothing is dropped).",
    },
    {
      id: "u2-q13",
      question: "Which hyperparameter search strategy scales worst as the number of hyperparameters grows?",
      options: ["Random Search", "Grid Search", "Bayesian Optimization", "Manual tuning by an expert"],
      correct: 1,
      explanation:
        "Grid search tries every combination, so its cost grows multiplicatively with each new hyperparameter (Example 9.1) — random search and Bayesian optimization scale far more gracefully.",
    },
    {
      id: "u2-q14",
      question: "Which architecture first introduced residual (skip) connections?",
      options: ["AlexNet", "VGG", "GoogLeNet", "ResNet"],
      correct: 3,
      explanation:
        "ResNet (He et al., 2015) introduced the residual block H(x) = F(x) + x, using identity shortcuts to solve the degradation problem in very deep networks.",
    },
    {
      id: "u2-q15",
      question: "In an Inception module, the 1×1 convolutions are primarily used to:",
      options: [
        "Increase the spatial (height/width) size of the feature map",
        "Reduce the channel depth before the expensive 3×3 / 5×5 convolutions run",
        "Add colour information",
        "Replace the need for any pooling branch",
      ],
      correct: 1,
      explanation:
        "These 'bottleneck' 1×1 convolutions cut the number of channels first, so the following 3×3/5×5 convolutions operate on far fewer channels — see Example 10.1 for the ≈10× parameter saving this produces.",
    },
  ],
};
