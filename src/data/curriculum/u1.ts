import type { Unit } from "@/lib/content/types";

export const u1: Unit = {
  id: "u1",
  number: 1,
  code: "UNIT 1",
  title: "Introduction to Deep Learning",
  subtitle: "Perceptron · Learning Paradigms · Loss Functions · Backpropagation · Gradient Descent",
  description:
    "Start from the biological neuron and the perceptron, understand how networks learn through loss functions, backpropagation and gradient descent — with every worked example from the notes.",
  sourceFile: "CCE3144_Deep_Learning_Unit1.pdf",
  topics: ["Perceptron", "Loss Functions", "Backpropagation", "SGD"],
  lessons: [
    /* ---------------------------------------------------------------- */
    {
      id: "u1-l1",
      title: "What is Deep Learning?",
      subtitle: "Where DL sits inside AI, why it exploded in the 2010s, and how a brain cell became a math formula.",
      minutes: 9,
      sections: [
        {
          id: "u1-l1-s1",
          title: "Deep Learning in one picture",
          blocks: [
            {
              type: "text",
              value:
                "Deep Learning (DL) is the branch of Machine Learning that uses multi-layered (“deep”) artificial neural networks to learn directly from data.",
            },
            { type: "widget", widgetId: "u1-ai-ml-dl", title: "AI ⊃ ML ⊃ DL — and what depth does", description: "Explore the nesting of AI, ML and DL, then step through how an image is recognised layer by layer — edges → shapes → parts → objects." },
            {
              type: "bullets",
              items: [
                "Deep Learning is a **subset of Machine Learning (ML)**, which itself is a subset of **Artificial Intelligence (AI)**.",
                "It uses artificial neural networks with **many hidden layers** to automatically learn **hierarchical representations** of raw data.",
                "Unlike classical ML, DL removes the need for **manual / hand-crafted feature engineering** — the network learns useful features by itself.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "Example — image recognition hierarchy",
              blocks: [
                {
                  type: "text",
                  value:
                    "Early layers detect **edges** → middle layers detect **shapes/textures** → deeper layers detect **object parts** → final layers recognise the **whole object**.",
                },
              ],
            },
          ],
        },
        {
          id: "u1-l1-s2",
          title: "Why Deep Learning now? — the three enablers",
          blocks: [
            {
              type: "text",
              value:
                "The core ideas are old, so what changed? Three things made deep networks practical at the same time:",
            },
            {
              type: "table",
              headers: ["Enabler", "What it provides", "Examples"],
              rows: [
                ["Big Data", "Massive labelled and unlabelled datasets to train large models", "ImageNet, web-scale text"],
                ["Compute Power", "GPUs / TPUs parallelise the huge number of matrix multiplications", "NVIDIA GPUs, Google TPUs"],
                ["Algorithmic Advances", "Better activations, optimisers and regularisation make very deep networks trainable", "ReLU, Adam, RMSProp, Dropout, Batch Normalisation"],
              ],
            },
          ],
        },
        {
          id: "u1-l1-s3",
          title: "Applications of Deep Learning",
          blocks: [
            {
              type: "table",
              headers: ["Domain", "Example applications"],
              rows: [
                ["Computer Vision", "Image classification, object detection, face recognition"],
                ["Natural Language Processing", "Machine translation, chatbots, sentiment analysis"],
                ["Speech Processing", "Speech-to-text, voice assistants"],
                ["Healthcare", "Disease diagnosis from scans, drug discovery"],
                ["Autonomous Systems", "Self-driving cars, robotic control"],
              ],
            },
          ],
        },
        {
          id: "u1-l1-s4",
          title: "Biological inspiration — from neuron to perceptron",
          blocks: [
            {
              type: "text",
              value:
                "Artificial neurons are loosely inspired by biological neurons in the brain. Hover each part of the interactive diagram below to see the analogy.",
            },
            { type: "widget", widgetId: "u1-neuron", title: "Biological vs artificial neuron", description: "Hover the parts of a real neuron to discover which artificial component each one inspired." },
            {
              type: "table",
              headers: ["Biological part", "Artificial counterpart"],
              rows: [
                ["Dendrites (receive signals)", "Inputs $x_1, x_2, \\dots, x_n$"],
                ["Soma (accumulates signals)", "Weighted summation $\\sum$"],
                ["Axon (fires if threshold crossed)", "Activation function producing an output"],
                ["Synapse strength", "Weight $w_i$ — learning = adjusting these weights"],
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u1-l2",
      title: "The Perceptron",
      subtitle: "The simplest neuron: weighted sum, bias, step function — and the line it draws through data.",
      minutes: 14,
      sections: [
        {
          id: "u1-l2-s1",
          title: "Definition and mathematical model",
          blocks: [
            {
              type: "text",
              value:
                "Proposed by **Frank Rosenblatt (1958)**, building on the earlier McCulloch–Pitts neuron model (1943). A perceptron is the simplest artificial neuron: it performs **binary classification** by drawing a straight-line (linear) decision boundary between two classes. It is the fundamental building block of larger Multi-Layer Perceptrons.",
            },
            {
              type: "text",
              value: "A perceptron performs two operations in sequence — a weighted summation, then a non-linear activation:",
            },
            {
              type: "formula",
              tex: "z = w_1x_1 + w_2x_2 + \\dots + w_nx_n + b = \\sum_i w_ix_i + b",
              caption: "Net input — a linear combination of the inputs",
            },
            {
              type: "formula",
              tex: "y = f(z) = \\begin{cases} 1 & \\text{if } z \\ge 0 \\\\ 0 & \\text{if } z < 0 \\end{cases}",
              caption: "Output — unit-step (threshold) activation",
            },
            {
              type: "heading",
              value: "Significance of each component",
            },
            {
              type: "table",
              headers: ["Component", "Role"],
              rows: [
                ["Inputs $x_1\\dots x_n$", "Numeric feature values describing the pattern to be classified"],
                ["Weights $w_1\\dots w_n$", "Learnable parameters deciding how strongly each input influences the output; learned from data"],
                ["Bias $b$", "Shifts the decision boundary away from the origin, so the boundary need not pass through $(0,0)$"],
                ["Net input $z$", "Geometrically: the (signed) distance of a point from the decision hyperplane"],
                ["Activation $f(z)$", "Converts the continuous net input into a discrete class decision (0 or 1)"],
              ],
            },
          ],
        },
        {
          id: "u1-l2-s2",
          title: "Geometric interpretation — linear separability",
          blocks: [
            {
              type: "bullets",
              items: [
                "The equation $\\sum w_ix_i + b = 0$ defines a **straight line** (2 inputs), a **plane** (3 inputs), or a **hyperplane** ($n$ inputs) that separates the input space into two half-spaces.",
                "A perceptron can classify a dataset correctly **only if the two classes are linearly separable** — i.e. some hyperplane can separate them completely.",
              ],
            },
            {
              type: "widget",
              widgetId: "u1-perceptron-lab",
              title: "Perceptron playground",
              description: "Drag the weights and bias to move the decision line. Try the AND, OR and XOR presets — watch how XOR can never be separated by one straight line.",
            },
          ],
        },
        {
          id: "u1-l2-s3",
          title: "The perceptron learning algorithm",
          blocks: [
            {
              type: "text",
              value: "Weights are learned iteratively so that the perceptron's output matches the desired target for every training example.",
            },
            {
              type: "numbered",
              items: [
                "**Initialise** — set weights $w_i$ and bias $b$ to 0 (or small random values); choose a learning rate $\\eta$, $0 < \\eta \\le 1$.",
                "**For every training pair $(x, t)$** — (a) compute the net input $z = \\sum w_ix_i + b$; (b) compute the predicted output $y = f(z)$; (c) compute the error $e = t - y$; (d) update every weight $w_i \\leftarrow w_i + \\eta \\cdot e \\cdot x_i$; (e) update the bias $b \\leftarrow b + \\eta \\cdot e$.",
                "**Repeat** — one pass over all examples is one **epoch**. Repeat over multiple epochs until an entire epoch produces **zero errors** (convergence), or a maximum number of epochs is reached.",
              ],
            },
            {
              type: "formula",
              tex: "w_i(\\text{new}) = w_i(\\text{old}) + \\eta\\,(t-y)\\,x_i \\qquad b(\\text{new}) = b(\\text{old}) + \\eta\\,(t-y)",
              caption: "The perceptron learning rule",
            },
            {
              type: "callout",
              variant: "info",
              title: "Why does this update rule work?",
              blocks: [
                {
                  type: "bullets",
                  items: [
                    "If the prediction is already correct ($e = 0$): no change is made — there is nothing to fix.",
                    "If $t = 1$ but $y = 0$ ($e = +1$): weights increase along $x_i$, raising $z$ next time so it is more likely to cross the threshold and fire.",
                    "If $t = 0$ but $y = 1$ ($e = -1$): weights decrease, lowering $z$ next time so it stays below threshold.",
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "Perceptron Convergence Theorem",
              blocks: [
                {
                  type: "text",
                  value:
                    "If the two classes are linearly separable, this algorithm is **guaranteed** to find a separating hyperplane in a finite number of steps.",
                },
              ],
            },
          ],
        },
        {
          id: "u1-l2-s4",
          title: "Worked example — training a perceptron on the AND gate",
          blocks: [
            {
              type: "example",
              title: "Learning the AND function (full trace, computer-verified)",
              given: [
                "Truth table: AND(0,0)=0, AND(0,1)=0, AND(1,0)=0, AND(1,1)=1",
                "Initial weights $w_1 = 0$, $w_2 = 0$, bias $b = 0$, learning rate $\\eta = 1$",
                "Unit-step activation: $z \\ge 0 \\Rightarrow y = 1$",
              ],
              steps: [
                {
                  label: "Epoch 1, sample 1: $x=(0,0)$, $t=0$ — only the bias can move",
                  blocks: [
                    { type: "formula", tex: "z = (0)(0)+(0)(0)+0 = 0 \\;\\Rightarrow\\; y = 1 \\;(z \\ge 0)" },
                    { type: "formula", tex: "e = t - y = -1 \\;\\Rightarrow\\; b \\leftarrow 0 + 1(-1) = -1" },
                    {
                      type: "text",
                      value:
                        "Both inputs are 0, so only the bias absorbs the correction — weights cannot change when their input is 0.",
                    },
                  ],
                },
                {
                  label: "Epoch 1, samples 2–3: $x=(0,1)$ and $x=(1,0)$, $t=0$ — already correct",
                  blocks: [
                    { type: "formula", tex: "z = -1 < 0 \\Rightarrow y = 0,\\; e = 0 \\;\\Rightarrow\\; \\text{no update}" },
                    {
                      type: "text",
                      value:
                        "Zero error means the current weights already work for these samples — the rule leaves them untouched.",
                    },
                  ],
                },
                {
                  label: "Epoch 1, sample 4: $x=(1,1)$, $t=1$ — the positive example is missed",
                  blocks: [
                    { type: "formula", tex: "z = (0)(1)+(0)(1)+(-1) = -1 \\;\\Rightarrow\\; y = 0,\\; e = +1" },
                    { type: "formula", tex: "w_1 \\leftarrow 0+1(1)(1)=1,\\quad w_2 \\leftarrow 1,\\quad b \\leftarrow -1+1 = 0" },
                    {
                      type: "text",
                      value:
                        "The only positive example was misclassified as 0, so weights increase along both active inputs, pushing $z$ upward for this pattern next time.",
                    },
                  ],
                },
                {
                  label: "Epochs 2–6 (the full trace)",
                  blocks: [
                    {
                      type: "widget",
                      widgetId: "u1-and-training",
                      title: "AND-gate training, step by step",
                      description: "Walk through every sample of every epoch exactly as in the notes, and watch the decision line converge to 2x₁ + x₂ − 3 = 0.",
                    },
                    {
                      type: "table",
                      headers: ["Ep.", "(x₁,x₂)", "t", "z", "y", "t−y", "New (w₁,w₂,b)"],
                      rows: [
                        ["1", "0,0", "0", "0", "1", "−1", "0, 0, −1"],
                        ["1", "0,1", "0", "−1", "0", "0", "0, 0, −1"],
                        ["1", "1,0", "0", "−1", "0", "0", "0, 0, −1"],
                        ["1", "1,1", "1", "−1", "0", "1", "1, 1, 0"],
                        ["2", "0,0", "0", "0", "1", "−1", "1, 1, −1"],
                        ["2", "0,1", "0", "0", "1", "−1", "1, 0, −2"],
                        ["2", "1,0", "0", "−1", "0", "0", "1, 0, −2"],
                        ["2", "1,1", "1", "−1", "0", "1", "2, 1, −1"],
                        ["…", "…", "…", "…", "…", "…", "…"],
                        ["6", "1,1", "1", "0", "1", "0", "2, 1, −3 ✓ converged"],
                      ],
                      caption: "Epoch 6 produces zero error on all four patterns → training has converged. Final weights: w₁ = 2, w₂ = 1, b = −3.",
                    },
                  ],
                },
                {
                  label: "Verification and decision boundary",
                  blocks: [
                    {
                      type: "table",
                      headers: ["x₁", "x₂", "z = 2x₁+x₂−3", "y", "t", "Match?"],
                      rows: [
                        ["0", "0", "−3", "0", "0", "✓"],
                        ["0", "1", "−2", "0", "0", "✓"],
                        ["1", "0", "−1", "0", "0", "✓"],
                        ["1", "1", "0", "1", "1", "✓"],
                      ],
                    },
                    {
                      type: "formula",
                      tex: "2x_1 + x_2 - 3 = 0 \\;\\iff\\; x_2 = 3 - 2x_1",
                      caption: "The learned line places (1,1) on the positive side and the other 3 points on the negative side",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u1-l2-s5",
          title: "The XOR problem — the perceptron's famous limitation",
          blocks: [
            {
              type: "table",
              headers: ["x₁", "x₂", "XOR", "Class"],
              rows: [
                ["0", "0", "0", "Class 0"],
                ["0", "1", "1", "Class 1"],
                ["1", "0", "1", "Class 1"],
                ["1", "1", "0", "Class 0"],
              ],
            },
            {
              type: "bullets",
              items: [
                "Class 0 points ${(0,0),(1,1)}$ and Class 1 points ${(0,1),(1,0)}$ lie on **opposite diagonals** of the unit square — no single straight line can separate them.",
                "**Formally:** no $w_1, w_2, b$ satisfy all four inequalities implied by the XOR truth table simultaneously (adding the inequalities for $(0,0)$ and $(1,1)$ contradicts those for $(0,1)$ and $(1,0)$).",
                "This limitation, highlighted by **Minsky & Papert (1969)**, was resolved by stacking multiple perceptron layers — the **Multi-Layer Perceptron (MLP)** — trained with **Backpropagation**.",
                "XOR is solved by a **2-2-1 MLP** (2 inputs → 2 hidden neurons → 1 output neuron) with hard step activations — the output effectively computes $h_1 \\text{ AND } (\\text{NOT } h_2)$.",
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u1-check-1",
                  question: "A perceptron uses the rule “output = 1 if z ≥ 0, else 0”. If the net input z = 0, the output is:",
                  options: ["0", "1", "0.5", "Undefined"],
                  correct: 1,
                  explanation:
                    "Since the rule includes equality (z ≥ 0), a net input of exactly 0 satisfies the condition, so the output is 1.",
                },
                {
                  id: "u1-check-2",
                  question: "A single-layer perceptron can correctly classify:",
                  options: [
                    "Only linearly separable patterns",
                    "Any arbitrary pattern",
                    "Only XOR-type patterns",
                    "Only non-linear patterns",
                  ],
                  correct: 0,
                  explanation:
                    "A perceptron's decision boundary is a straight line / hyperplane, so it can separate only linearly separable classes (e.g. AND, OR) — not patterns like XOR.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u1-l3",
      title: "Learning Paradigms — Supervised vs Unsupervised",
      subtitle: "What “learning” means for a network, and how K-Means finds structure without labels.",
      minutes: 10,
      sections: [
        {
          id: "u1-l3-s1",
          title: "Learning and recognition",
          blocks: [
            {
              type: "text",
              value:
                "**“Learning”** in a neural network means automatically adjusting weights from data. **“Recognition”** is the use of the trained network to identify / classify new, unseen patterns. Based on the nature of the training data, learning is broadly divided into supervised and unsupervised learning.",
            },
            {
              type: "compare",
              pairs: [
                {
                  label: "Supervised Learning",
                  left: [
                    "Training data: **labelled** pairs $(X, Y)$ — Y is the known correct target",
                    "Goal: learn a mapping $f: X \\to Y$ that minimises the difference between predicted and actual outputs",
                    "Two task types: **Classification** (discrete category — spam / not spam, digit 0–9) and **Regression** (continuous value — house price, temperature)",
                    "Examples: email spam detection, disease diagnosis from labelled scans, house-price prediction, the AND-gate perceptron",
                    "Typical algorithms: Perceptron, Logistic Regression, CNN",
                  ],
                },
                {
                  label: "Unsupervised Learning",
                  left: [
                    "Training data: **only inputs X**, no target labels",
                    "Goal: discover hidden structure, patterns, or groupings by itself",
                    "Common tasks: **clustering**, dimensionality reduction, anomaly detection",
                    "Examples: customer segmentation, grouping news articles by topic, anomaly detection in network traffic",
                    "Typical algorithms: K-Means, PCA, Autoencoders",
                  ],
                },
              ],
            },
            {
              type: "table",
              headers: ["Aspect", "Supervised Learning", "Unsupervised Learning"],
              rows: [
                ["Training data", "Labelled (X, Y)", "Unlabelled (X only)"],
                ["Goal", "Learn mapping X → Y", "Discover hidden structure"],
                ["Feedback", "Direct error signal (loss)", "No explicit error signal"],
                ["Typical tasks", "Classification, Regression", "Clustering, Dimensionality reduction"],
                ["Example algorithms", "Perceptron, Logistic Regression, CNN", "K-Means, PCA, Autoencoders"],
                ["Data cost", "Expensive (needs human labelling)", "Cheaper (labels not required)"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Semi-supervised learning (a bridge between the two)",
              blocks: [
                {
                  type: "text",
                  value:
                    "Trains on a small labelled set plus a much larger unlabelled set — used when labelling is expensive (e.g. expert radiologists) but raw data is cheap. The unlabelled data helps the model learn the input structure and generalise better.",
                },
              ],
            },
          ],
        },
        {
          id: "u1-l3-s2",
          title: "Worked example — K-Means clustering (one iteration)",
          blocks: [
            {
              type: "text",
              value:
                "K-Means is a classic unsupervised algorithm that groups data into k clusters by iteratively updating cluster centroids — all without ever using a target label.",
            },
            { type: "widget", widgetId: "u1-kmeans", title: "K-Means lab", description: "Run the exact 4-point example from the notes one step at a time, then add your own points and watch centroids migrate." },
            {
              type: "example",
              title: "K-Means, 4 points, k = 2",
              given: [
                "Points: A(1,1), B(2,1), C(4,3), D(5,4)",
                "Initial centroids: $C_1 = (1,1)$, $C_2 = (5,4)$",
              ],
              steps: [
                {
                  label: "Step 1 — Assign each point to its nearest centroid (Euclidean distance)",
                  blocks: [
                    {
                      type: "bullets",
                      items: [
                        "A(1,1): $d(C_1) = 0.00$, $d(C_2) = \\sqrt{25} = 5.00$ → **Cluster 1**",
                        "B(2,1): $d(C_1) = 1.00$, $d(C_2) = \\sqrt{9+9} = 4.24$ → **Cluster 1**",
                        "C(4,3): $d(C_1) = \\sqrt{9+4} = 3.61$, $d(C_2) = \\sqrt{2} = 1.41$ → **Cluster 2**",
                        "D(5,4): $d(C_1) = 5.00$, $d(C_2) = 0.00$ → **Cluster 2**",
                      ],
                    },
                  ],
                },
                {
                  label: "Step 2 — Recompute centroids as the mean of assigned points",
                  blocks: [
                    {
                      type: "bullets",
                      items: [
                        "Cluster 1 = {A(1,1), B(2,1)} → new $C_1 = (1.50, 1.00)$",
                        "Cluster 2 = {C(4,3), D(5,4)} → new $C_2 = (4.50, 3.50)$",
                      ],
                    },
                  ],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "Each iteration pulls the centroid toward the centre of mass of its assigned points; the process repeats until centroids stop moving (convergence) — all without ever using a target label.",
                    },
                  ],
                },
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u1-check-3",
                  question: "Which of the following is an example of unsupervised learning?",
                  options: [
                    "Predicting house price from features",
                    "Email spam classification",
                    "Customer segmentation without labels",
                    "Digit recognition using labelled images",
                  ],
                  correct: 2,
                  explanation:
                    "Customer segmentation without labels has no target output — the algorithm must discover groups on its own, the defining feature of unsupervised learning.",
                },
                {
                  id: "u1-check-4",
                  question: "In supervised learning, the training data consists of:",
                  options: [
                    "Only input features",
                    "Input–output (labelled) pairs",
                    "Randomly generated numbers",
                    "Only cluster centroids",
                  ],
                  correct: 1,
                  explanation:
                    "Supervised learning requires labelled data: every input X is paired with its correct output / target Y.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u1-l4",
      title: "Loss Functions",
      subtitle: "MSE, MAE, Binary and Categorical Cross-Entropy — the numbers training tries to minimise.",
      minutes: 12,
      sections: [
        {
          id: "u1-l4-s1",
          title: "What is a loss function?",
          blocks: [
            {
              type: "bullets",
              items: [
                "A loss function $L(Y, \\hat{Y})$ quantifies how far the model's prediction $\\hat{Y}$ is from the actual target $Y$ — a **single number** that training tries to minimise.",
                "It is the objective that **backpropagation differentiates** and that **gradient descent minimises**.",
                "Choice depends on the task: **regression** uses distance-based losses; **classification** uses probability-based losses.",
              ],
            },
          ],
        },
        {
          id: "u1-l4-s2",
          title: "Regression loss — MSE and MAE",
          blocks: [
            {
              type: "formula",
              tex: "\\text{MSE} = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2 \\qquad \\text{MAE} = \\frac{1}{n}\\sum_{i=1}^{n}|y_i - \\hat{y}_i|",
            },
            {
              type: "bullets",
              items: [
                "Squaring is used instead of the raw error because: (i) it **removes the sign** so positive and negative errors do not cancel, and (ii) it **penalises large errors much more heavily** than small ones — a useful, differentiable property for gradient-based learning.",
              ],
            },
            {
              type: "example",
              title: "MSE / MAE — predicted vs actual house prices (₹ lakh)",
              given: ["Actual y = [50, 60, 70]", "Predicted ŷ = [48, 65, 68]"],
              steps: [
                {
                  label: "Errors and squared errors",
                  blocks: [
                    {
                      type: "table",
                      headers: ["Actual (y)", "Predicted (ŷ)", "Error (y−ŷ)", "Squared error", "|Error|"],
                      rows: [
                        ["50", "48", "2", "4", "2"],
                        ["60", "65", "−5", "25", "5"],
                        ["70", "68", "2", "4", "2"],
                      ],
                    },
                  ],
                },
                {
                  label: "MSE = (1/3)(4 + 25 + 4) = 11.00",
                  blocks: [
                    { type: "formula", tex: "\\text{MSE} = \\tfrac{1}{3}(33) = 11.00 \\qquad \\text{MAE} = \\tfrac{1}{3}(9) = 3.00" },
                  ],
                },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "MSE (11.0) is pulled upward by the single larger error of −5, illustrating how squaring emphasises big mistakes more than MAE does.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u1-l4-s3",
          title: "Classification loss — Binary Cross-Entropy (BCE)",
          blocks: [
            {
              type: "formula",
              tex: "\\text{BCE} = -\\big[\\, y\\cdot\\log(p) + (1-y)\\cdot\\log(1-p) \\,\\big]",
              caption: "y ∈ {0,1} is the true label; p = P(y=1) is the predicted probability",
            },
            {
              type: "text",
              value:
                "This comes from **Maximum Likelihood**: for $y=1$ we want $p$ close to 1 (loss $=-\\log p$, small when $p \\to 1$); for $y=0$ we want $p$ close to 0 (loss $=-\\log(1-p)$, small when $p \\to 0$).",
            },
            {
              type: "example",
              title: "Binary Cross-Entropy — three samples",
              steps: [
                {
                  label: "Compute each loss",
                  blocks: [
                    {
                      type: "table",
                      headers: ["y (actual)", "p (predicted prob.)", "Loss formula used", "Loss value"],
                      rows: [
                        ["1", "0.90", "−log(0.90)", "0.1054"],
                        ["0", "0.20", "−log(1−0.20) = −log(0.80)", "0.2231"],
                        ["1", "0.60", "−log(0.60)", "0.5108"],
                      ],
                    },
                  ],
                },
                {
                  label: "Average BCE = (0.1054+0.2231+0.5108)/3 = 0.2798",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "Sample 3 (y=1, p=0.60) contributes the largest loss because the model was **correct but not confident** — BCE rewards confident, correct predictions and punishes confident, wrong ones very heavily.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u1-l4-s4",
          title: "Categorical Cross-Entropy (multi-class)",
          blocks: [
            {
              type: "formula",
              tex: "\\text{CCE} = -\\sum_i t_i \\log(p_i)",
              caption: "t = one-hot target, p = softmax output",
            },
            {
              type: "example",
              title: "3-class problem, true class = 2 (one-hot target = [0,1,0])",
              steps: [
                {
                  label: "Good prediction: softmax output [0.2, 0.7, 0.1]",
                  blocks: [
                    { type: "formula", tex: "\\text{CCE} = -\\log(0.7) = 0.357" },
                    { type: "text", value: "Confident and correct — low loss." },
                  ],
                },
                {
                  label: "Poor prediction: softmax output [0.6, 0.1, 0.3]",
                  blocks: [
                    { type: "formula", tex: "\\text{CCE} = -\\log(0.1) = 2.303" },
                    { type: "text", value: "Confident but wrong — very high loss." },
                  ],
                },
                {
                  label: "Key observation",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "Only the predicted probability assigned to the **true class** matters — all other softmax entries drop out because $t_i = 0$ for them.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u1-l4-s5",
          title: "Why Cross-Entropy instead of MSE for classification?",
          blocks: [
            {
              type: "widget",
              widgetId: "u1-loss-lab",
              title: "Loss landscape explorer",
              description: "Move the predicted probability and watch every loss react. Notice how −log(p) punishes confident mistakes while MSE flattens out.",
            },
            {
              type: "bullets",
              items: [
                "With a sigmoid/softmax output, **MSE gradients become very small (“flat”)** when the prediction is confidently wrong — learning stalls.",
                "Cross-entropy's gradient with respect to the net input simplifies to $(\\hat{y} - y)$, which stays **large exactly when the prediction is confidently wrong** — a strong, consistent learning signal.",
                "Cross-entropy is also the theoretically correct loss under a **maximum-likelihood** interpretation of classification.",
              ],
            },
            {
              type: "table",
              headers: ["Loss function", "Task", "Formula (per sample)"],
              rows: [
                ["Mean Squared Error (MSE)", "Regression", "$(y-\\hat{y})^2$"],
                ["Mean Absolute Error (MAE)", "Regression (robust to outliers)", "$|y-\\hat{y}|$"],
                ["Binary Cross-Entropy", "Binary classification", "$-[y \\log p + (1-y)\\log(1-p)]$"],
                ["Categorical Cross-Entropy", "Multi-class classification", "$-\\sum_i t_i \\log(p_i)$"],
              ],
              caption: "Summary of common loss functions",
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u1-check-5",
                  question: "As the predicted probability for the correct class approaches 0, the Cross-Entropy loss:",
                  options: ["Approaches 0", "Approaches 1", "Approaches infinity", "Becomes negative"],
                  correct: 2,
                  explanation:
                    "As p→0 for the true class, −log(p)→∞; cross-entropy imposes an unbounded penalty on confidently wrong predictions.",
                },
                {
                  id: "u1-check-6",
                  question: "MSE is typically used as a loss function for:",
                  options: ["Classification problems", "Regression problems", "Clustering problems", "Reinforcement-learning rewards"],
                  correct: 1,
                  explanation:
                    "MSE measures the squared numeric distance between predicted and actual continuous values — the standard loss for regression.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u1-l5",
      title: "Backpropagation",
      subtitle: "The chain rule, applied layer by layer — with the complete 2-2-1 network worked example.",
      minutes: 16,
      sections: [
        {
          id: "u1-l5-s1",
          title: "Why is backpropagation needed?",
          blocks: [
            {
              type: "bullets",
              items: [
                "A single perceptron can only learn a **linear boundary**. Multi-Layer Perceptrons (MLPs) stack hidden layers to model **non-linear** relationships.",
                "But the simple perceptron rule does not say how to update weights feeding **hidden neurons** — there is no direct target for a hidden neuron's output.",
                "Backpropagation solves this: it propagates the output error **backward through the network, layer by layer, using the chain rule**, to compute $\\partial L/\\partial w$ for every weight — including hidden-layer weights.",
              ],
            },
          ],
        },
        {
          id: "u1-l5-s2",
          title: "The chain rule of differentiation",
          blocks: [
            {
              type: "formula",
              tex: "\\text{If } y = f(u) \\text{ and } u = g(x), \\quad \\text{then } \\frac{dy}{dx} = \\frac{dy}{du}\\times\\frac{du}{dx}",
            },
            {
              type: "example",
              title: "Chain rule warm-up: y = (2x+1)² at x = 3",
              steps: [
                { label: "Substitute u = 2x+1", blocks: [{ type: "formula", tex: "u = 2(3)+1 = 7, \\quad y = u^2 = 49" }] },
                { label: "Local derivatives", blocks: [{ type: "formula", tex: "\\frac{dy}{du} = 2u = 14, \\qquad \\frac{du}{dx} = 2" }] },
                { label: "Multiply", blocks: [{ type: "formula", tex: "\\frac{dy}{dx} = 14 \\times 2 = 28 \\;\\checkmark \\;(\\text{matches } 4(2x+1) = 28)" }] },
                {
                  label: "Significance",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "In a network, the Loss depends on a weight through a chain of nested functions (weight → net input → activation → … → Loss). Backpropagation is simply this chain rule applied repeatedly, one layer at a time.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u1-l5-s3",
          title: "Forward pass and backward pass",
          blocks: [
            {
              type: "compare",
              pairs: [
                {
                  label: "Forward pass",
                  left: [
                    "Inputs flow **left-to-right** through the network to produce a prediction",
                    "Every intermediate activation is **stored** for later use",
                  ],
                },
                {
                  label: "Backward pass",
                  left: [
                    "Starting from the loss, gradients flow **right-to-left** using the chain rule",
                    "Computes $\\partial L/\\partial w$ for **every** weight",
                    "Update: every weight is then adjusted by gradient descent",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u1-l5-s4",
          title: "Complete worked example — 2-2-1 sigmoid network",
          blocks: [
            {
              type: "widget",
              widgetId: "u1-backprop-lab",
              title: "Backpropagation lab — walk the exact numbers",
              description: "Step through the forward pass, both backward passes and the weight update of the notes' 2-2-1 network. Change the inputs and watch every gradient recompute live.",
            },
            {
              type: "example",
              title: "Forward pass → backward pass → update (full calculation)",
              given: [
                "Network: 2 inputs → 2 hidden neurons (sigmoid) → 1 output neuron (sigmoid)",
                "Inputs $x_1 = 0.5$, $x_2 = 0.3$ · Target = 1.0 · Learning rate $\\eta = 0.5$",
                "Weights $w_1..w_6$ = 0.2, 0.4, 0.3, 0.1, 0.5, 0.6 · Biases $b_{h1} = 0.25$, $b_{h2} = 0.20$, $b_o = 0.4$",
                "Loss $L = \\frac{1}{2}(\\text{target} - \\text{output})^2$ · Sigmoid: $\\sigma(z) = 1/(1+e^{-z})$, $\\sigma'(z) = \\sigma(z)(1-\\sigma(z))$",
              ],
              steps: [
                {
                  label: "Step 1 — Forward pass",
                  blocks: [
                    { type: "formula", tex: "h_1^{in} = 0.5(0.2)+0.3(0.4)+0.25 = 0.4700 \\;\\Rightarrow\\; h_1^{out} = \\sigma(0.47) = 0.6154" },
                    { type: "formula", tex: "h_2^{in} = 0.5(0.3)+0.3(0.1)+0.20 = 0.3800 \\;\\Rightarrow\\; h_2^{out} = \\sigma(0.38) = 0.5939" },
                    { type: "formula", tex: "o_{in} = 0.6154(0.5)+0.5939(0.6)+0.4 = 1.0640 \\;\\Rightarrow\\; o_{out} = \\sigma(1.064) = 0.7435" },
                    { type: "formula", tex: "L = \\tfrac{1}{2}(1 - 0.7435)^2 = \\tfrac{1}{2}(0.2565)^2 = 0.0329" },
                  ],
                },
                {
                  label: "Step 2 — Backward pass: output layer",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial o_{out}} = -(1 - 0.7435) = -0.2565" },
                    { type: "formula", tex: "\\frac{\\partial o_{out}}{\\partial o_{in}} = 0.7435(1-0.7435) = 0.1907 \\;(\\text{sigmoid derivative})" },
                    { type: "formula", tex: "\\delta_o = -0.2565 \\times 0.1907 = -0.0489" },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial w_5} = \\delta_o \\times h_1^{out} = -0.0301, \\qquad \\frac{\\partial L}{\\partial w_6} = \\delta_o \\times h_2^{out} = -0.0291" },
                    {
                      type: "text",
                      value:
                        "$\\delta_o$ summarises “how much the loss would change per unit change in the output neuron's net input”. It is computed once and reused for every weight feeding that neuron.",
                    },
                  ],
                },
                {
                  label: "Step 3 — Backward pass: hidden layer",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial h_1^{out}} = \\delta_o \\times w_5 = -0.0245" },
                    { type: "formula", tex: "\\delta_{h1} = -0.0245 \\times 0.6154(1-0.6154) = -0.0245 \\times 0.2367 = -0.0058" },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial w_1} = \\delta_{h1} \\times x_1 = -0.0029, \\qquad \\frac{\\partial L}{\\partial w_2} = \\delta_{h1} \\times x_2 = -0.0017" },
                    { type: "formula", tex: "\\delta_{h2} = -0.0294 \\times 0.2412 = -0.0071 \\;\\Rightarrow\\; \\frac{\\partial L}{\\partial w_3} = -0.0035,\\; \\frac{\\partial L}{\\partial w_4} = -0.0021" },
                    {
                      type: "text",
                      value:
                        "Notice $\\delta_o$ is reused (multiplied by $w_5$ or $w_6$) rather than recomputed — this reuse of already-computed quantities, propagating backward layer by layer, is precisely what makes backpropagation efficient.",
                    },
                  ],
                },
                {
                  label: "Step 4 — Weight update (w ← w − η ∂L/∂w, η = 0.5)",
                  blocks: [
                    {
                      type: "table",
                      headers: ["Parameter", "Old", "Gradient ∂L/∂w", "Update", "New"],
                      rows: [
                        ["w₁", "0.2000", "−0.0029", "0.2 − 0.5(−0.0029)", "0.2014"],
                        ["w₂", "0.4000", "−0.0017", "0.4 − 0.5(−0.0017)", "0.4009"],
                        ["w₃", "0.3000", "−0.0035", "0.3 − 0.5(−0.0035)", "0.3018"],
                        ["w₄", "0.1000", "−0.0021", "0.1 − 0.5(−0.0021)", "0.1011"],
                        ["w₅", "0.5000", "−0.0301", "0.5 − 0.5(−0.0301)", "0.5151"],
                        ["w₆", "0.6000", "−0.0291", "0.6 − 0.5(−0.0291)", "0.6145"],
                        ["bₒ", "0.4000", "−0.0489", "0.4 − 0.5(−0.0489)", "0.4245"],
                      ],
                    },
                  ],
                },
                {
                  label: "Verification",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "Re-running the forward pass with the updated weights gives new $o_{out} = 0.7515$ and new Loss $= 0.0309$ — down from 0.0329. **The loss decreased after just one step**, confirming the gradients were computed in the correct direction.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u1-l5-s5",
          title: "Key observations & the vanishing gradient",
          blocks: [
            {
              type: "bullets",
              items: [
                "Backpropagation is not a different mathematical idea from the chain rule — it applies it **systematically, layer by layer, reusing intermediate results** for efficiency.",
                "The **“delta” (δ)** at each neuron is the essential reusable quantity: $\\delta = \\partial L / \\partial(\\text{net input of that neuron})$.",
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Vanishing gradient problem",
              blocks: [
                {
                  type: "text",
                  value:
                    "The sigmoid derivative $\\sigma'(z)$ never exceeds **0.25**. When many such factors (each < 1) are multiplied together across many layers, the gradient reaching early layers shrinks toward zero — making very deep sigmoid/tanh networks slow or unable to learn. **ReLU activation largely avoids this.**",
                },
              ],
            },
          ],
        },
        {
          id: "u1-l5-s6",
          title: "Common activation functions",
          blocks: [
            { type: "widget", widgetId: "u1-activation-plot", title: "Activation function explorer", description: "Compare Sigmoid, Tanh and ReLU with their derivatives. Hover the curves to read exact values and see where gradients vanish." },
            {
              type: "table",
              headers: ["Activation", "Range", "Typical use"],
              rows: [
                ["Sigmoid", "(0, 1)", "Output layer for binary classification / probabilities"],
                ["Tanh", "(−1, 1)", "Hidden layers (zero-centred output helps optimisation)"],
                ["ReLU", "[0, ∞)", "Hidden layers of deep networks (fast, reduces vanishing gradient)"],
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u1-check-7",
                  question: "Backpropagation primarily relies on which mathematical concept?",
                  options: ["Integration", "Chain rule of differentiation", "Matrix inversion", "Fourier transform"],
                  correct: 1,
                  explanation:
                    "Backpropagation computes ∂L/∂w for every weight by repeatedly applying the chain rule of differentiation across layers.",
                },
                {
                  id: "u1-check-8",
                  question: "The vanishing gradient problem is most commonly associated with:",
                  options: [
                    "ReLU activation in shallow networks",
                    "Sigmoid / Tanh activations in deep networks",
                    "Linear activation only",
                    "The output layer bias term",
                  ],
                  correct: 1,
                  explanation:
                    "Sigmoid/Tanh derivatives are always below 1; multiplying many such small numbers across many layers shrinks the gradient toward zero for early layers.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u1-l6",
      title: "Gradient Descent & SGD",
      subtitle: "Batch, stochastic and mini-batch — how big a step, on how much data, how often.",
      minutes: 10,
      sections: [
        {
          id: "u1-l6-s1",
          title: "Gradient descent — recap",
          blocks: [
            {
              type: "formula",
              tex: "w \\leftarrow w - \\eta \\cdot \\frac{\\partial L}{\\partial w}",
              caption: "The gradient descent update rule",
            },
            {
              type: "bullets",
              items: [
                "$\\partial L/\\partial w$ (the gradient) points in the direction of **steepest increase** of the loss; moving opposite to it (the minus sign) decreases the loss fastest.",
                "$\\eta$ (learning rate) controls the step size. **Too small** → very slow convergence. **Too large** → the loss can oscillate or diverge.",
                "Applied repeatedly until the loss stops decreasing appreciably (convergence).",
              ],
            },
          ],
        },
        {
          id: "u1-l6-s2",
          title: "Batch, stochastic and mini-batch gradient descent",
          blocks: [
            {
              type: "widget",
              widgetId: "u1-gd-lab",
              title: "Gradient descent playground",
              description: "Pick a learning rate and watch the optimizer descend a loss surface — too small crawls, too large diverges. Then compare the smooth Batch path against the noisy SGD path step by step.",
            },
            {
              type: "bullets",
              items: [
                "**Batch Gradient Descent** — computes the gradient using the **entire training set** before every update. Accurate, smooth path, but slow and memory-heavy for large datasets.",
                "**Stochastic Gradient Descent (SGD)** — computes the gradient using **just one randomly chosen example** per update. Very fast per step; noise can help escape shallow local minima, but the path is noisy / zig-zag.",
                "**Mini-Batch Gradient Descent** — gradient over a **small batch (e.g. 32 or 64)** per update — the practical middle ground, and the most common choice in deep learning.",
              ],
            },
            {
              type: "table",
              headers: ["Basis", "Batch GD", "Mini-Batch GD", "Stochastic GD"],
              rows: [
                ["Data used / update", "Entire dataset", "Small batch (e.g. 32)", "1 sample"],
                ["Update speed", "Slow", "Moderate", "Fast"],
                ["Gradient accuracy", "Exact / smooth", "Approximate", "Very noisy"],
                ["Memory needed", "High", "Moderate", "Low"],
                ["Common use", "Small datasets", "Deep learning (default)", "Online / streaming data"],
              ],
            },
          ],
        },
        {
          id: "u1-l6-s3",
          title: "Worked example — Batch GD vs SGD",
          blocks: [
            {
              type: "example",
              title: "Linear regression ŷ = wx + b, three points",
              given: [
                "Data: (1,3), (2,5), (3,7)",
                "Start: w = 1.0, b = 0.5, learning rate η = 0.1",
                "Loss $L = \\frac{1}{n}\\sum(\\hat{y}-y)^2$, so $\\frac{\\partial L}{\\partial w} = \\frac{2}{n}\\sum(\\hat{y}-y)x$ and $\\frac{\\partial L}{\\partial b} = \\frac{2}{n}\\sum(\\hat{y}-y)$",
              ],
              steps: [
                {
                  label: "Predictions and errors from the starting point",
                  blocks: [
                    {
                      type: "table",
                      headers: ["x", "y (actual)", "ŷ = wx+b", "error (ŷ−y)"],
                      rows: [
                        ["1", "3", "1.50", "−1.50"],
                        ["2", "5", "2.50", "−2.50"],
                        ["3", "7", "3.50", "−3.50"],
                      ],
                    },
                  ],
                },
                {
                  label: "Batch GD update (uses all 3 points at once)",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial w} = \\tfrac{2}{3}[(-1.5)(1)+(-2.5)(2)+(-3.5)(3)] = \\tfrac{2}{3}(-17) = -11.3333" },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial b} = \\tfrac{2}{3}(-7.5) = -5.0000" },
                    { type: "formula", tex: "w_{new} = 1.0 - 0.1(-11.3333) = 2.1333, \\qquad b_{new} = 0.5 - 0.1(-5) = 1.0000" },
                  ],
                },
                {
                  label: "SGD update (uses only the 1st point: x=1, y=3)",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial w} = 2(-1.5)(1) = -3.0000, \\qquad \\frac{\\partial L}{\\partial b} = 2(-1.5) = -3.0000" },
                    { type: "formula", tex: "w_{new} = 1.0 - 0.1(-3) = 1.3000, \\qquad b_{new} = 0.5 - 0.1(-3) = 0.8000" },
                  ],
                },
                {
                  label: "Comparing the two updates",
                  blocks: [
                    {
                      type: "bullets",
                      items: [
                        "Batch GD moved further in one step (w: 1.0 → 2.1333) because it used the combined signal from all 3 (increasingly wrong) points at once.",
                        "SGD moved less (w: 1.0 → 1.3000) using just one point — but it takes 3 such quick updates per epoch versus Batch GD's 1.",
                        "In practice, SGD / mini-batch updates are far cheaper, so they usually reach a good solution faster in wall-clock time despite the noisier path.",
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u1-check-9",
                  question: "If the learning rate in gradient descent is set too high, the most likely outcome is:",
                  options: [
                    "Very slow but stable convergence",
                    "The loss may oscillate or diverge instead of converging",
                    "The gradient becomes zero immediately",
                    "No effect on training at all",
                  ],
                  correct: 1,
                  explanation:
                    "An excessively large learning rate can cause the weight update to overshoot the minimum repeatedly, making the loss oscillate or diverge.",
                },
                {
                  id: "u1-check-10",
                  question: "Compared to Batch Gradient Descent, Stochastic Gradient Descent (SGD):",
                  options: [
                    "Uses the entire dataset for every update",
                    "Updates weights using one sample at a time — faster per update but noisier",
                    "Never converges to a solution",
                    "Always requires more memory than Batch GD",
                  ],
                  correct: 1,
                  explanation:
                    "SGD computes the gradient from a single randomly-chosen sample per update, so each step is cheap and fast but noisier than Batch GD.",
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
      id: "u1-q1",
      question: "The perceptron model was introduced by:",
      options: ["Geoffrey Hinton", "Frank Rosenblatt", "Yann LeCun", "Warren McCulloch"],
      correct: 1,
      explanation:
        "The perceptron was introduced by Frank Rosenblatt in 1958, building on the earlier McCulloch–Pitts neuron model (1943).",
    },
    {
      id: "u1-q2",
      question: "A perceptron uses the rule “output = 1 if z ≥ 0, else 0”. If the net input z = 0, the output is:",
      options: ["0", "1", "0.5", "Undefined"],
      correct: 1,
      explanation: "Since the rule includes equality (z ≥ 0), a net input of exactly 0 satisfies the condition, so the output is 1.",
    },
    {
      id: "u1-q3",
      question: "A single-layer perceptron can correctly classify:",
      options: ["Only linearly separable patterns", "Any arbitrary pattern", "Only XOR-type patterns", "Only non-linear patterns"],
      correct: 0,
      explanation:
        "A perceptron's decision boundary is a straight line / hyperplane, so it can separate only linearly separable classes (e.g. AND, OR) — not patterns like XOR.",
    },
    {
      id: "u1-q4",
      question: "Which of the following is an example of unsupervised learning?",
      options: [
        "Predicting house price from features",
        "Email spam classification",
        "Customer segmentation without labels",
        "Digit recognition using labelled images",
      ],
      correct: 2,
      explanation:
        "Customer segmentation without labels has no target output — the algorithm must discover groups on its own, the defining feature of unsupervised learning.",
    },
    {
      id: "u1-q5",
      question: "In supervised learning, the training data consists of:",
      options: ["Only input features", "Input–output (labelled) pairs", "Randomly generated numbers", "Only cluster centroids"],
      correct: 1,
      explanation: "Supervised learning requires labelled data: every input X is paired with its correct output / target Y.",
    },
    {
      id: "u1-q6",
      question: "K-Means clustering is a technique used in:",
      options: ["Supervised regression", "Supervised classification", "Unsupervised learning", "Reinforcement learning"],
      correct: 2,
      explanation:
        "K-Means groups data using only input features (X), with no target labels, making it an unsupervised learning algorithm.",
    },
    {
      id: "u1-q7",
      question: "Mean Squared Error (MSE) is typically used as a loss function for:",
      options: ["Classification problems", "Regression problems", "Clustering problems", "Reinforcement-learning rewards"],
      correct: 1,
      explanation:
        "MSE measures the squared numeric distance between predicted and actual continuous values — the standard loss for regression.",
    },
    {
      id: "u1-q8",
      question: "Binary Cross-Entropy loss is minimised (→ 0) when:",
      options: [
        "The predicted probability moves away from the actual label",
        "The predicted probability always equals 0.5",
        "The predicted probability approaches the actual label",
        "The predicted probability is always 1",
      ],
      correct: 2,
      explanation: "BCE = −[y·log(p) + (1−y)·log(1−p)] approaches 0 exactly when p is close to the true label y.",
    },
    {
      id: "u1-q9",
      question: "As the predicted probability for the correct class approaches 0, the Cross-Entropy loss:",
      options: ["Approaches 0", "Approaches 1", "Approaches infinity", "Becomes negative"],
      correct: 2,
      explanation:
        "As p→0 for the true class, −log(p)→∞; cross-entropy imposes an unbounded penalty on confidently wrong predictions.",
    },
    {
      id: "u1-q10",
      question: "Backpropagation primarily relies on which mathematical concept?",
      options: ["Integration", "Chain rule of differentiation", "Matrix inversion", "Fourier transform"],
      correct: 1,
      explanation:
        "Backpropagation computes ∂L/∂w for every weight by repeatedly applying the chain rule of differentiation across layers.",
    },
    {
      id: "u1-q11",
      question: "In backpropagation, error gradients are propagated:",
      options: [
        "From the input layer to the output layer",
        "From the output layer backward to the input layer",
        "Randomly across layers",
        "Only within the hidden layer",
      ],
      correct: 1,
      explanation:
        "Gradients are computed starting at the output layer and propagated backward, layer by layer, toward the input layer — hence the name “backpropagation”.",
    },
    {
      id: "u1-q12",
      question: "The vanishing gradient problem is most commonly associated with:",
      options: [
        "ReLU activation in shallow networks",
        "Sigmoid / Tanh activations in deep networks",
        "Linear activation only",
        "The output layer bias term",
      ],
      correct: 1,
      explanation:
        "Sigmoid/Tanh derivatives are always below 1; multiplying many such small numbers across many layers shrinks the gradient toward zero for early layers in deep networks.",
    },
    {
      id: "u1-q13",
      question: "In gradient descent, weights are updated in the direction of the:",
      options: ["Positive gradient", "Negative gradient", "Random direction", "Zero gradient"],
      correct: 1,
      explanation:
        "The gradient points toward increasing loss, so gradient descent moves opposite to it (negative-gradient direction) to reduce the loss.",
    },
    {
      id: "u1-q14",
      question: "Compared to Batch Gradient Descent, Stochastic Gradient Descent (SGD):",
      options: [
        "Uses the entire dataset for every update",
        "Updates weights using one sample at a time — faster per update but noisier",
        "Never converges to a solution",
        "Always requires more memory than Batch GD",
      ],
      correct: 1,
      explanation:
        "SGD computes the gradient from a single randomly-chosen sample per update, so each step is cheap and fast but noisier than Batch GD.",
    },
    {
      id: "u1-q15",
      question: "If the learning rate in gradient descent is set too high, the most likely outcome is:",
      options: [
        "Very slow but stable convergence",
        "The loss may oscillate or diverge instead of converging",
        "The gradient becomes zero immediately",
        "No effect on training at all",
      ],
      correct: 1,
      explanation:
        "An excessively large learning rate can cause the weight update to overshoot the minimum repeatedly, making the loss oscillate or diverge.",
    },
  ],
};
