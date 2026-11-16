import type { Unit } from "@/lib/content/types";

export const u3: Unit = {
  id: "u3",
  number: 3,
  code: "UNIT 3",
  title: "Recurrent Neural Networks",
  subtitle: "RNN · LSTM · GRU · RNN Language Models",
  description:
    "Sequences carry meaning in their order — text, speech, time series and video all demand a network with memory. This unit builds the recurrent hidden state, trains it with BPTT, fixes its vanishing gradients with the gated LSTM and GRU cells, and turns it into a language model scored by perplexity — with every worked example from the notes.",
  sourceFile: "CCE3144_RNN_LSTM_GRU_Unit3.pdf",
  topics: ["RNN & BPTT", "LSTM", "GRU", "Language Models & Perplexity"],
  lessons: [
    /* ---------------------------------------------------------------- */
    {
      id: "u3-l1",
      title: "Sequential Data & the Recurrent Idea",
      subtitle: "Why order matters, why feedforward networks break on sequences, and the one idea — a shared-weight hidden state — that fixes everything.",
      minutes: 9,
      sections: [
        {
          id: "u3-l1-s1",
          title: "What is sequential data?",
          blocks: [
            {
              type: "text",
              value:
                "**Sequential data** is data in which **order carries meaning** — rearranging the elements changes (or destroys) the meaning. This is different from ordinary tabular data, where the order of rows does not matter.",
            },
            {
              type: "text",
              value: "Common examples of sequential data:",
            },
            {
              type: "table",
              headers: ["Type of sequence", "What flows through time"],
              rows: [
                ["Text / language", "A sentence is a sequence of words — “dog bites man” ≠ “man bites dog”"],
                ["Speech / audio", "A sequence of sound-pressure samples over time"],
                ["Time series", "Stock prices, weather readings, sensor logs — numeric values indexed by time"],
                ["Video", "A sequence of image frames"],
                ["Biological sequences", "DNA base pairs, protein amino-acid chains"],
              ],
            },
          ],
        },
        {
          id: "u3-l1-s2",
          title: "Three properties every sequence model must respect",
          blocks: [
            {
              type: "text",
              value:
                "Sequential data shares three properties that any model of it must respect:",
            },
            {
              type: "bullets",
              items: [
                "**Variable length** — sequences in a dataset are rarely all the same length (sentences are not all the same number of words).",
                "**Order-dependent** — shuffling the elements changes (or destroys) the meaning.",
                "**Long-range dependencies** — something at position 2 can affect the correct interpretation of position 50.",
              ],
            },
          ],
        },
        {
          id: "u3-l1-s3",
          title: "Why feedforward networks struggle with sequences",
          blocks: [
            {
              type: "text",
              value:
                "A standard feedforward network (MLP) or a plain CNN expects **one fixed-size input vector** and produces one output, **independently of any other input it has ever seen**. This creates four concrete problems for sequence data:",
            },
            {
              type: "bullets",
              items: [
                "**Fixed input size.** An MLP needs a fixed number of input features, but sentences and time series vary in length.",
                "**No memory.** Each input is processed in isolation; the network has no mechanism to “remember” earlier inputs when processing the current one.",
                "**No parameter sharing across positions.** If we tried to flatten a sequence into one long fixed vector, the network would need separate weights for “word at position 5” versus “word at position 50” — this does not generalise to lengths not seen in training and wastes parameters.",
                "**Violates the independence assumption.** Standard supervised learning assumes examples are independent; elements inside a sequence are, by definition, statistically dependent on their neighbours.",
              ],
            },
          ],
        },
        {
          id: "u3-l1-s4",
          title: "The core idea of a recurrent network",
          blocks: [
            {
              type: "text",
              value:
                "A feedforward network has no memory; a recurrent network feeds its hidden state back into itself, carrying information from one time step to the next. An RNN is built from one idea:",
            },
            {
              type: "bullets",
              items: [
                "An RNN maintains a **hidden state** (also called the “context” or “memory”), denoted $h_t$.",
                "At every time step $t$, the network reads the current input $x_t$ and **combines it with the previous hidden state** $h_{t-1}$ to produce a new hidden state $h_t$.",
                "The **same weight matrices are reused at every time step** (parameter sharing across time). This is the single most important structural idea in this unit — it is what lets a fixed-size set of parameters handle sequences of any length.",
                "$h_t$ acts as a **compressed summary** of everything the network has read up to and including time $t$.",
                "An output $y_t$ (a class label, a predicted next word, a predicted next value, etc.) can be produced from $h_t$ at any time step where one is needed.",
              ],
            },
            {
              type: "formula",
              tex: "h_t = f(x_t,\\; h_{t-1})",
              caption: "The general recurrence relation — the whole unit in one line",
            },
            {
              type: "callout",
              variant: "key",
              title: "Key insight",
              blocks: [
                {
                  type: "text",
                  value:
                    "A Recurrent Neural Network (RNN) fixes all four feedforward problems at once by introducing a hidden state that is updated at every time step **using the same weights**. This single idea — a **feedback loop with shared parameters** — is what allows one compact model to process sequences of any length.",
                },
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u3-check-1",
                  question: "Which of the following is NOT a defining property of sequential data?",
                  options: [
                    "Every sequence in the dataset must have exactly the same length",
                    "The order of elements affects the meaning",
                    "Later elements can depend on much earlier elements",
                    "Elements are not statistically independent of their neighbours",
                  ],
                  correct: 0,
                  explanation:
                    "Sequential data is explicitly allowed to be of variable length — sentences, audio clips and time series routinely differ in length. This variability is precisely why fixed-size-input feedforward networks struggle with sequences, and why RNNs, which process one element at a time and share weights across positions, are needed. The other three options all describe real properties of sequential data.",
                },
                {
                  id: "u3-check-2",
                  question:
                    "What is the single most important structural idea that lets an RNN process sequences of any length using a fixed number of parameters?",
                  options: [
                    "Using convolutional filters that slide over the input",
                    "Increasing the hidden size whenever the sequence is longer",
                    "Sharing the same weight matrices across all time steps",
                    "Training a separate small network for every time step",
                  ],
                  correct: 2,
                  explanation:
                    "Because Wxh, Whh, Why (and their biases) are reused, identically, at every time step, the total number of parameters does not grow with sequence length — a 5-word sentence and a 500-word document are processed by exactly the same set of weights, applied repeatedly. Training a separate network per step is effectively the opposite of parameter sharing and would not generalise to unseen lengths.",
                },
              ],
            },
          ],
        },
        {
          id: "u3-l1-s5",
          title: "Notation used throughout this unit",
          blocks: [
            {
              type: "text",
              value:
                "The table below fixes the notation used in every lesson that follows, so that the same symbol always means the same thing.",
            },
            {
              type: "table",
              headers: ["Symbol", "Meaning"],
              rows: [
                ["$x_t$", "Input vector at time step $t$"],
                ["$h_t$", "Hidden state (memory) at time step $t$"],
                ["$y_t$", "Output produced at time step $t$"],
                ["$W_{xh},\\; W_{hh},\\; W_{hy}$", "Weight matrices: input→hidden, hidden→hidden, hidden→output"],
                ["$b_h,\\; b_y$", "Bias vectors for the hidden and output layers"],
                ["tanh, σ", "Hyperbolic-tangent and sigmoid activation functions"],
                ["⊙", "Element-wise (Hadamard) product"],
                ["$L$", "Loss function"],
                ["$\\partial L/\\partial\\,\\square$", "Partial derivative of the loss with respect to □ (used in backpropagation)"],
                ["$T$", "Length of the input sequence"],
              ],
            },
          ],
        },
        {
          id: "u3-l1-s6",
          title: "Applications of recurrent networks",
          blocks: [
            {
              type: "text",
              value:
                "Because they can model dependencies across time, recurrent networks (and their gated variants, LSTM and GRU) have been used across a wide range of tasks:",
            },
            {
              type: "bullets",
              items: [
                "Language modelling and text generation (predicting the next word/character).",
                "Machine translation (sequence-to-sequence, encoder–decoder models).",
                "Speech recognition (audio waveform → text).",
                "Sentiment analysis and text classification.",
                "Time-series forecasting — stock prices, electricity demand, weather.",
                "Music and handwriting generation.",
                "Video captioning and action recognition.",
                "Chatbots and dialogue systems (largely superseded today by Transformers, but RNNs remain the conceptual foundation and are still used in resource-constrained / streaming settings).",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u3-l2",
      title: "Inside the RNN — Architecture & Forward Pass",
      subtitle: "Folded vs unrolled, the three forward-pass equations, the complete hand-worked Example 1, and the five wiring patterns.",
      minutes: 16,
      sections: [
        {
          id: "u3-l2-s1",
          title: "Folded cell vs unrolled network",
          blocks: [
            {
              type: "bullets",
              items: [
                "A simple (“vanilla”) RNN is a **single cell that is applied repeatedly**, once per time step, with the same weights every time.",
                "Drawing this repetition out explicitly over time steps is called **unrolling** the network — it turns the recurrent (looped) picture into an ordinary, feedforward-looking computational graph that we can apply standard backpropagation to.",
              ],
            },
            {
              type: "compare",
              pairs: [
                {
                  label: "Folded view",
                  left: [
                    "A single RNN cell with a **feedback loop** — the hidden-state output wraps back into the cell's own input.",
                    "A compact picture of the recurrence rule itself.",
                    "The weights are written once; the loop implies their reuse at every step.",
                  ],
                  right: [
                    "One copy of the cell drawn **per time step** $t = 1, \\dots, T$, connected in a chain.",
                    "Every column uses the **identical weight matrices** $W_{xh}, W_{hh}, W_{hy}$.",
                    "Turns the looped computation into an ordinary acyclic graph, so standard backpropagation applies directly (this is BPTT).",
                  ],
                },
              ],
            },
            { type: "widget", widgetId: "u3-rnn-lab", title: "RNN cell lab — folded, unrolled, step by step", description: "Feed a sequence through the cell and watch the hidden state update at every step — the same three weight matrices are reused everywhere." },
          ],
        },
        {
          id: "u3-l2-s2",
          title: "Inside one cell — the forward-pass equations",
          blocks: [
            {
              type: "text",
              value:
                "Zooming into a single time step shows exactly what happens inside the cell: the previous hidden state and the current input are each **linearly transformed, summed with a bias, and squashed by tanh** to produce the new hidden state.",
            },
            {
              type: "formula",
              tex: "a_t = W_{xh}\\,x_t + W_{hh}\\,h_{t-1} + b_h",
              caption: "Pre-activation — new input + carried-forward memory + bias",
            },
            {
              type: "formula",
              tex: "h_t = \\tanh(a_t)",
              caption: "New hidden state, squashed into (−1, 1)",
            },
            {
              type: "formula",
              tex: "y_t = W_{hy}\\,h_t + b_y",
              caption: "Read-out — turns the internal memory into the task's output",
            },
            {
              type: "heading",
              value: "Significance of each term",
            },
            {
              type: "bullets",
              items: [
                "$W_{xh}x_t$ — brings in **new information** from the current input.",
                "$W_{hh}h_{t-1}$ — brings forward **everything remembered so far** from the past.",
                "$\\tanh(\\cdot)$ — a nonlinearity that (a) lets the network represent non-linear relationships and (b) squashes the state into $(-1, 1)$, keeping it numerically bounded step after step.",
                "$W_{hy}h_t + b_y$ — a **read-out layer** that turns the internal memory into whatever output the task needs (a class score, a predicted value, next-word logits, …).",
              ],
            },
          ],
        },
        {
          id: "u3-l2-s3",
          title: "Worked Example 1 — RNN forward pass, step by step",
          blocks: [
            {
              type: "callout",
              variant: "tip",
              title: "How to read the worked examples",
              blocks: [
                {
                  type: "text",
                  value:
                    "All worked examples in this unit reuse the same two input vectors wherever possible, so you can directly compare how an RNN, an LSTM and a GRU each process identical data. Every architecture is introduced with a plain-language explanation first, then the exact equations, then a fully worked numerical example — read them in that order.",
                },
              ],
            },
            {
              type: "example",
              title: "Worked Example 1 — RNN forward pass (T = 3, hidden size 2)",
              given: [
                "Input sequence (input size 2): $x_1 = [1.0000, 0.5000]$, $x_2 = [0.5000, -1.0000]$, $x_3 = [-0.5000, 1.0000]$",
                "Initial hidden state: $h_0 = [0.0000, 0.0000]$",
                "$W_{xh} = [[0.5000, -0.3000], [0.2000, 0.4000]]$, $W_{hh} = [[0.1000, 0.4000], [-0.2000, 0.3000]]$, $b_h = [0.1000, -0.1000]$",
                "$W_{hy} = [[0.6000, -0.3000], [0.2000, 0.5000]]$, $b_y = [0.1000, 0.2000]$",
              ],
              steps: [
                {
                  label: "Step 1 — Compute $h_1$ (process the first input)",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "We need $a_1 = W_{xh}x_1 + W_{hh}h_0 + b_h$. Since $h_0 = [0, 0]$, the recurrent term contributes nothing yet — this is the very first step, so there is no history to bring forward.",
                    },
                    { type: "formula", tex: "W_{xh}x_1 = (0.5 \\times 1.0 + (-0.3) \\times 0.5,\\;\\; 0.2 \\times 1.0 + 0.4 \\times 0.5) = (0.35,\\; 0.40)" },
                    { type: "formula", tex: "a_1 = (0.35, 0.40) + (0, 0) + (0.1, -0.1) = [0.4500, 0.3000]" },
                    { type: "formula", tex: "h_1 = \\tanh([0.4500, 0.3000]) = [0.4219, 0.2913]" },
                    {
                      type: "callout",
                      variant: "tip",
                      title: "Why this step matters",
                      blocks: [
                        {
                          type: "text",
                          value:
                            "tanh squashes each pre-activation into $(-1, 1)$. Both components of $a_1$ were modest in size, so tanh has **not saturated** — the gradient through this step will still be healthy (we revisit this idea when we meet the vanishing gradient).",
                        },
                      ],
                    },
                  ],
                },
                {
                  label: "Step 2 — Compute $h_2$ (now the recurrence is active)",
                  blocks: [
                    { type: "formula", tex: "W_{xh}x_2 = (0.5 \\times 0.5 + (-0.3) \\times (-1.0),\\;\\; 0.2 \\times 0.5 + 0.4 \\times (-1.0)) = (0.5500, -0.3000)" },
                    { type: "formula", tex: "W_{hh}h_1 = (0.1 \\times 0.4219 + 0.4 \\times 0.2913,\\;\\; -0.2 \\times 0.4219 + 0.3 \\times 0.2913) = (0.1587, 0.0030)" },
                    { type: "formula", tex: "a_2 = (0.5500, -0.3000) + (0.1587, 0.0030) + (0.1, -0.1) = [0.8087, -0.3970]" },
                    { type: "formula", tex: "h_2 = \\tanh([0.8087, -0.3970]) = [0.6689, -0.3774]" },
                    {
                      type: "text",
                      value:
                        "Notice that $h_2$ depends on $x_2$ **and** on $h_1$ (which itself depended on $x_1$). This is exactly how the RNN carries information forward — $h_2$ already contains a trace of $x_1$.",
                    },
                  ],
                },
                {
                  label: "Step 3 — Compute $h_3$",
                  blocks: [
                    { type: "formula", tex: "W_{xh}x_3 = (-0.5500, 0.3000), \\qquad W_{hh}h_2 = (-0.0841, -0.2470)" },
                    { type: "formula", tex: "a_3 = [-0.5341, -0.0470] \\;\\Rightarrow\\; h_3 = \\tanh([-0.5341, -0.0470]) = [-0.4885, -0.0470]" },
                  ],
                },
                {
                  label: "Step 4 — Produce the output $y_3$",
                  blocks: [
                    { type: "formula", tex: "y_3 = W_{hy}h_3 + b_y = [[0.6, -0.3], [0.2, 0.5]] \\times [-0.4885, -0.0470] + [0.1, 0.2] = [-0.1790, 0.0788]" },
                    {
                      type: "text",
                      value:
                        "This is a **many-to-one read-out**: we only needed an output at the final time step (e.g. classifying the whole sequence). If a prediction were needed at every step, the same $W_{hy}, b_y$ read-out would be applied to $h_1$ and $h_2$ as well.",
                    },
                  ],
                },
                {
                  label: "Summary of Worked Example 1",
                  blocks: [
                    {
                      type: "table",
                      headers: ["t", "Input $x_t$", "Pre-activation $a_t$", "Hidden state $h_t = \\tanh(a_t)$"],
                      rows: [
                        ["1", "[1.0000, 0.5000]", "[0.4500, 0.3000]", "[0.4219, 0.2913]"],
                        ["2", "[0.5000, −1.0000]", "[0.8087, −0.3970]", "[0.6689, −0.3774]"],
                        ["3", "[−0.5000, 1.0000]", "[−0.5341, −0.0470]", "[−0.4885, −0.0470] → $y_3 = [-0.1790, 0.0788]$"],
                      ],
                      caption: "Table 1 — the full forward pass at a glance.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u3-l2-s4",
          title: "Types of RNN architectures — five wiring patterns",
          blocks: [
            {
              type: "text",
              value:
                "The recurrence itself never changes; what changes from application to application is simply **where inputs enter and where outputs are read out**. Five standard input/output wiring patterns can be built from the same recurrent cell.",
            },
            { type: "widget", widgetId: "u3-seq-patterns", title: "The five input/output wiring patterns", description: "Explore one-to-one, one-to-many, many-to-one, many-to-many (aligned) and encoder–decoder wiring — all built from the same recurrent cell." },
            {
              type: "table",
              headers: ["Pattern", "Wiring", "Typical example"],
              rows: [
                ["One-to-one", "A single input maps to a single output", "Degenerates to a normal feedforward layer (rarely used with recurrence, shown for completeness)"],
                ["One-to-many", "One input, a whole output sequence", "Image captioning: one image → a sentence"],
                ["Many-to-one", "A whole input sequence, one output", "Sentiment classification — the pattern used in Worked Example 1"],
                ["Many-to-many (aligned)", "One output per input, same length", "Part-of-speech tagging"],
                ["Many-to-many (encoder–decoder)", "An encoder RNN compresses the input into a context vector; a separate decoder RNN generates the (possibly different-length) output sequence from it", "Machine translation"],
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u3-l3",
      title: "Training RNNs — BPTT & the Vanishing Gradient",
      subtitle: "Unroll and backpropagate through time: the complete BPTT worked example, and why gradients vanish or explode as λᵀ.",
      minutes: 15,
      sections: [
        {
          id: "u3-l3-s1",
          title: "Backpropagation Through Time (BPTT)",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Idea:** unroll the RNN for all $T$ time steps, which turns it into one large feedforward computational graph — then apply **ordinary backpropagation** to that graph.",
                "Because the same weight matrix (say $W_{hh}$) is reused at every time step, its **total gradient is the sum** of the gradient contributed at every time step:",
              ],
            },
            {
              type: "formula",
              tex: "\\frac{\\partial L}{\\partial W_{hh}} = \\sum_{t=1}^{T} \\frac{\\partial L}{\\partial a_t} \\otimes h_{t-1}",
              caption: "Total W\u2095\u2095 gradient = sum over all time steps (⊗ = outer product)",
            },
            {
              type: "text",
              value:
                "Each backward step from $h_t$ to $h_{t-1}$ multiplies the incoming gradient by $W_{hh}^{T}$ and by the local tanh derivative — this **repeated multiplication** is the root cause of the vanishing/exploding gradient problem. In the unrolled picture, the loss gradient flows backward through every copy of the network, moving from $h_3$ back to $h_2$, $h_1$ and $h_0$.",
            },
            { type: "widget", widgetId: "u3-bptt-lab", title: "BPTT gradient-flow lab", description: "Watch the loss gradient flow backward from the output through every copy of the unrolled network — one matrix multiply and one tanh squeeze per step." },
          ],
        },
        {
          id: "u3-l3-s2",
          title: "Worked Example 2 — BPTT gradient computation",
          blocks: [
            {
              type: "example",
              title: "Worked Example 2 — BPTT, continuing Worked Example 1",
              given: [
                "Continue Worked Example 1. A target output $target_3 = [1.0000, 0.0000]$ is supplied (one-hot encoding for class 0).",
                "Squared-error loss applied at the final time step only (a many-to-one setup):",
                "$L = \\frac{1}{2}\\|y_3 - target_3\\|^2 = \\frac{1}{2}\\|[-0.1790, 0.0788] - [1.0000, 0.0000]\\|^2 = 0.6981$",
              ],
              steps: [
                {
                  label: "Step 1 — Gradient at the output",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial y_3} = y_3 - target_3 = [-0.1790, 0.0788] - [1.0000, 0.0000] = [-1.1790, 0.0788]" },
                    {
                      type: "text",
                      value:
                        "For squared error, $\\partial L/\\partial y = $ predicted − target — the gradient simply points from the prediction toward the target, scaled by the error.",
                    },
                  ],
                },
                {
                  label: "Step 2 — Backprop into $h_3$ through the output layer",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial h_3} = W_{hy}^{T}\\,\\frac{\\partial L}{\\partial y_3} = [[0.6, -0.3], [0.2, 0.5]]^{T} \\times [-1.1790, 0.0788] = [-0.6916, 0.3931]" },
                  ],
                },
                {
                  label: "Step 3 — Backprop through tanh at $t = 3$",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "The derivative of tanh is $1 - \\tanh^2(a) = 1 - h^2$, evaluated using the **already-computed forward-pass value** — this is why we saved every $h_t$ during the forward pass.",
                    },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial a_3} = \\frac{\\partial L}{\\partial h_3} \\odot (1 - h_3^2) = [-0.6916, 0.3931] \\odot (1 - [-0.4885, -0.0470]^2) = [-0.5266, 0.3922]" },
                  ],
                },
                {
                  label: "Step 4 — Gradient contribution to $W_{hh}$ from $t = 3$",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial W_{hh}}\\Big|_3 = \\frac{\\partial L}{\\partial a_3} \\otimes h_2 = [-0.5266, 0.3922] \\otimes [0.6689, -0.3774] = [[-0.3522, 0.1987], [0.2624, -0.1480]]" },
                    {
                      type: "text",
                      value:
                        "“⊗” here is an **outer product**: a gradient vector combined with the hidden state that was multiplied by $W_{hh}$ on the forward pass — this is the standard rule for the gradient of a matrix multiplication.",
                    },
                  ],
                },
                {
                  label: "Step 5 — Propagate the gradient back one more step, to $h_2$",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial h_2} = W_{hh}^{T}\\,\\frac{\\partial L}{\\partial a_3} = [[0.1, 0.4], [-0.2, 0.3]]^{T} \\times [-0.5266, 0.3922] = [-0.1311, -0.0930]" },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial a_2} = [-0.1311, -0.0930] \\odot (1 - [0.6689, -0.3774]^2) = [-0.0725, -0.0797]" },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial W_{hh}}\\Big|_2 = [-0.0725, -0.0797] \\otimes [0.4219, 0.2913] = [[-0.0306, -0.0211], [-0.0336, -0.0232]]" },
                  ],
                },
                {
                  label: "Step 6 — Propagate back to $h_1$, then to $h_0$",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial h_1} = [[0.1, 0.4], [-0.2, 0.3]]^{T} \\times [-0.0725, -0.0797] = [0.0087, -0.0529] \\;\\Rightarrow\\; \\frac{\\partial L}{\\partial a_1} = [0.0072, -0.0484]" },
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial W_{hh}}\\Big|_1 = [0.0072, -0.0484] \\otimes [0.0000, 0.0000] = [[0.0000, 0.0000], [0.0000, 0.0000]]" },
                    {
                      type: "callout",
                      variant: "info",
                      title: "Why this term is zero",
                      blocks: [
                        {
                          type: "text",
                          value:
                            "The contribution at $t = 1$ is multiplied by $h_0 = (0, 0)$, the initial hidden state. With a **zero initial state** there is nothing for the very first step to “multiply against” for this particular weight, so its contribution vanishes. This is a special case of using a zero initial state, **not a general property of BPTT**: the gradient signal $\\partial L/\\partial h_1$ itself is still non-zero, so it correctly continues to update $W_{xh}$ and $b_h$ through this step.",
                        },
                      ],
                    },
                  ],
                },
                {
                  label: "Step 7 — Total gradient (sum over all time steps)",
                  blocks: [
                    { type: "formula", tex: "\\frac{\\partial L}{\\partial W_{hh}} = \\frac{\\partial L}{\\partial W_{hh}}\\Big|_1 + \\frac{\\partial L}{\\partial W_{hh}}\\Big|_2 + \\frac{\\partial L}{\\partial W_{hh}}\\Big|_3" },
                    { type: "formula", tex: "= [[0, 0], [0, 0]] + [[-0.0306, -0.0211], [-0.0336, -0.0232]] + [[-0.3522, 0.1987], [0.2624, -0.1480]] = [[-0.3828, 0.1776], [0.2287, -0.1712]]" },
                    {
                      type: "text",
                      value:
                        "The same mechanism (chain rule + outer product with the relevant input, summed across time) also gives $\\partial L/\\partial W_{xh} = [[0.2342, -0.4506], [-0.2844, 0.4478]]$ and $\\partial L/\\partial W_{hy} = [[0.5759, 0.0554], [-0.0385, -0.0037]]$; these are left as Practice Question 32.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u3-l3-s3",
          title: "The vanishing and exploding gradient problem",
          blocks: [
            {
              type: "bullets",
              items: [
                "Look again at Steps 5–6 above: every step back multiplies the gradient by $W_{hh}^{T}$ and by a tanh-derivative factor that is **always ≤ 1**.",
                "Over $T$ time steps this becomes roughly a product of $T$ such factors — informally, **gradient $\\propto \\lambda^{T}$**, where $\\lambda$ reflects the typical size of $W_{hh}^{T} \\times \\tanh'$.",
                "If $\\lambda < 1$: the product **shrinks exponentially** with $T$ — the **vanishing gradient** problem. Early time steps receive a near-zero learning signal, so the network effectively cannot learn long-range dependencies.",
                "If $\\lambda > 1$: the product **grows exponentially** — the **exploding gradient** problem. Weight updates become huge and training diverges (loss becomes NaN / oscillates wildly).",
              ],
            },
            { type: "widget", widgetId: "u3-vanishing", title: "λᵀ — decay or blast-off", description: "Set the per-step factor λ and the number of backward steps k. Even a modest λ = 0.5 leaves almost nothing after 10 steps; λ = 1.5 grows past 50×." },
            {
              type: "table",
              headers: ["k (steps back)", "λ = 0.5 (vanishing)", "λ = 1.0 (stable)", "λ = 1.5 (exploding)"],
              rows: [
                ["1", "0.5000", "1.00", "1.5000"],
                ["2", "0.2500", "1.00", "2.2500"],
                ["3", "0.1250", "1.00", "3.3750"],
                ["5", "0.03125", "1.00", "7.5938"],
                ["10", "0.000977", "1.00", "57.665"],
              ],
              caption:
                "Table 2 — illustrative decay/growth of |λ\u1d4f| with the number of backward steps k. Relative gradient magnitude after k backward steps for three values of λ: even a modest λ = 0.5 leaves almost nothing after 10 steps; λ = 1.5 grows past 50×.",
            },
          ],
        },
        {
          id: "u3-l3-s4",
          title: "Standard mitigations",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Gradient clipping** — rescale the gradient if its norm exceeds a threshold; a simple, effective fix for exploding gradients.",
                "**Careful weight initialisation** (e.g. orthogonal initialisation of $W_{hh}$) — keeps $\\lambda$ close to 1 for longer.",
                "**Truncated BPTT** — limit how many steps gradients are propagated back through, trading long-range learning for stability/speed.",
                "**Gated architectures — LSTM and GRU** — redesign the recurrence itself so that gradients can flow across many steps largely unimpeded. This is the main solution used in practice, and is the subject of the next two lessons.",
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Exam point — which fix for which problem",
              blocks: [
                {
                  type: "text",
                  value:
                    "Match the mitigation to the disease: **gradient clipping** targets *exploding* gradients (it caps update size but does nothing for vanishing); **gated architectures (LSTM/GRU)** target *vanishing* gradients (they build an additive path the gradient can travel). Orthogonal initialisation and truncated BPTT are stability measures that help both regimes.",
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u3-l4",
      title: "Long Short-Term Memory (LSTM)",
      subtitle: "A conveyor-belt cell state protected by three gates — all seven equations and the complete two-timestep worked example.",
      minutes: 16,
      sections: [
        {
          id: "u3-l4-s1",
          title: "Motivation",
          blocks: [
            {
              type: "bullets",
              items: [
                "Plain RNNs struggle to learn long-range dependencies because gradients shrink (or blow up) exponentially as they are backpropagated through many time steps.",
                "**LSTM (Hochreiter & Schmidhuber, 1997)** fixes this by giving the network a **separate memory channel — the cell state** — that information can flow along with only minor, mostly linear changes, instead of being repeatedly squashed through a matrix multiply and a tanh at every step.",
                "**Three gates** (small neural networks with sigmoid outputs in $(0, 1)$) learn **when to write to, erase from, and read from** this memory.",
              ],
            },
          ],
        },
        {
          id: "u3-l4-s2",
          title: "Architecture — the cell state and its three gates",
          blocks: [
            {
              type: "text",
              value:
                "The LSTM keeps two running vectors — the cell state $C_t$ (long-term memory) and the hidden state $h_t$ (what is exposed to the outside). In the standard diagram, the cell state runs along the top with **only element-wise operations** — this is what protects the gradient from vanishing.",
            },
            {
              type: "bullets",
              items: [
                "**Cell state $C_t$** — the long-term memory “conveyor belt” running along the top of the diagram.",
                "**Forget gate $f_t$** — decides what fraction of the old cell state to keep.",
                "**Input gate $i_t$** — decides how much of the new candidate information to write in.",
                "**Candidate $\\tilde{c}_t$** — the new content proposed for the cell state (not yet gated).",
                "**Output gate $o_t$** — decides how much of the (updated) cell state to expose as the hidden state / output.",
              ],
            },
            { type: "widget", widgetId: "u3-lstm-lab", title: "LSTM cell lab", description: "Step through the gates — forget, input, candidate, output — and watch the cell-state conveyor belt carry memory across time steps." },
          ],
        },
        {
          id: "u3-l4-s3",
          title: "Equations and their significance",
          blocks: [
            {
              type: "text",
              value:
                "All four gates/candidates first form the same concatenated input, then apply their own weights:",
            },
            {
              type: "formula",
              tex: "z_t = [\\,h_{t-1};\\; x_t\\,]",
              caption: "Concatenate the previous hidden state and the current input",
            },
            {
              type: "formula",
              tex: "f_t = \\sigma(W_f z_t + b_f)",
              caption: "Forget gate",
            },
            {
              type: "formula",
              tex: "i_t = \\sigma(W_i z_t + b_i)",
              caption: "Input gate",
            },
            {
              type: "formula",
              tex: "\\tilde{c}_t = \\tanh(W_c z_t + b_c)",
              caption: "Candidate cell content",
            },
            {
              type: "formula",
              tex: "C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{c}_t",
              caption: "Cell-state update — the additive conveyor belt",
            },
            {
              type: "formula",
              tex: "o_t = \\sigma(W_o z_t + b_o)",
              caption: "Output gate",
            },
            {
              type: "formula",
              tex: "h_t = o_t \\odot \\tanh(C_t)",
              caption: "Hidden state — a gated view of the cell",
            },
            {
              type: "heading",
              value: "Significance of each equation",
            },
            {
              type: "bullets",
              items: [
                "**Forget gate** — a sigmoid output near 0 **erases** that part of memory; near 1 **preserves** it completely.",
                "**Input gate × candidate** — the network only writes new information where the input gate allows it, protecting unrelated parts of memory.",
                "**Cell-state update** — **additive and element-wise** (no matrix multiply, no squashing) — this is the key structural difference from a plain RNN, and is what allows gradients to flow across many steps largely unchanged.",
                "**Output gate** — the cell can hold information in $C_t$ without necessarily exposing it in $h_t$ — memory and “what to output right now” are decoupled.",
              ],
            },
          ],
        },
        {
          id: "u3-l4-s4",
          title: "Worked Example 3 — LSTM forward pass, step by step",
          blocks: [
            {
              type: "example",
              title: "Worked Example 3 — LSTM forward pass (both time steps)",
              given: [
                "Same two inputs as the RNN example, so the two architectures can be compared directly: $x_1 = [1.0000, 0.5000]$, $x_2 = [0.5000, -1.0000]$",
                "Initial state: $h_0 = [0.0000, 0.0000]$, $C_0 = [0.0000, 0.0000]$",
                "$W_f = [[0.3, 0.1, 0.2, -0.1], [-0.2, 0.4, 0.1, 0.3]]$, $b_f = [0.1000, 0.0000]$",
                "$W_i = [[0.2, -0.3, 0.4, 0.1], [0.1, 0.2, -0.2, 0.3]]$, $b_i = [0.0000, 0.1000]$",
                "$W_c = [[0.4, 0.1, -0.3, 0.2], [-0.1, 0.3, 0.2, 0.1]]$, $b_c = [0.1000, -0.1000]$",
                "$W_o = [[0.3, 0.2, 0.1, -0.2], [0.2, -0.1, 0.3, 0.1]]$, $b_o = [0.0000, 0.2000]$",
              ],
              steps: [
                {
                  label: "Step 1.1 — Build the concatenated input",
                  blocks: [
                    { type: "formula", tex: "z_1 = [h_0; x_1] = [0, 0, 1.0, 0.5]" },
                  ],
                },
                {
                  label: "Step 1.2 — Forget gate",
                  blocks: [
                    { type: "formula", tex: "W_f z_1 + b_f = (0.15, 0.25) + (0.1, 0.0) = (0.25, 0.25) \\;\\Rightarrow\\; f_1 = \\sigma(0.25, 0.25) = [0.5622, 0.5622]" },
                  ],
                },
                {
                  label: "Step 1.3 — Input gate",
                  blocks: [
                    { type: "formula", tex: "W_i z_1 + b_i = (0.45, -0.05) + (0.0, 0.1) = (0.45, 0.05) \\;\\Rightarrow\\; i_1 = \\sigma(0.45, 0.05) = [0.6106, 0.5125]" },
                  ],
                },
                {
                  label: "Step 1.4 — Candidate cell content",
                  blocks: [
                    { type: "formula", tex: "W_c z_1 + b_c = (-0.3, 0.25) + (0.1, -0.1) = (-0.2, 0.15) \\;\\Rightarrow\\; \\tilde{c}_1 = \\tanh(-0.2, 0.15) = [-0.0997, 0.1489]" },
                  ],
                },
                {
                  label: "Step 1.5 — Update the cell state",
                  blocks: [
                    { type: "formula", tex: "C_1 = f_1 \\odot C_0 + i_1 \\odot \\tilde{c}_1 = [0.5622, 0.5622] \\odot [0.0000, 0.0000] + [0.6106, 0.5125] \\odot [-0.0997, 0.1489]" },
                    { type: "formula", tex: "= [0.0000, 0.0000] + [-0.0609, 0.0763] = [-0.0609, 0.0763]" },
                    {
                      type: "text",
                      value:
                        "Because $C_0 = (0, 0)$, the forget gate has nothing to act on yet — the entire cell state at $t = 1$ comes from the new candidate, scaled by the input gate.",
                    },
                  ],
                },
                {
                  label: "Step 1.6 — Output gate",
                  blocks: [
                    { type: "formula", tex: "W_o z_1 + b_o = (0.0, 0.35) + (0.0, 0.2) = (0.0, 0.55) \\;\\Rightarrow\\; o_1 = \\sigma(0.0, 0.55) = [0.5000, 0.6341]" },
                  ],
                },
                {
                  label: "Step 1.7 — Hidden state",
                  blocks: [
                    { type: "formula", tex: "h_1 = o_1 \\odot \\tanh(C_1) = [0.5000, 0.6341] \\odot \\tanh([-0.0609, 0.0763]) = [-0.0304, 0.0483]" },
                  ],
                },
                {
                  label: "Time step $t = 2$ — the identical six equations, re-applied",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "The identical six equations are applied again, now using $h_1$ and $C_1$ from the previous step and the new input $x_2 = [0.5000, -1.0000]$: $z_2 = [h_1; x_2] = [-0.0304, 0.0483, 0.5000, -1.0000]$.",
                    },
                    {
                      type: "table",
                      headers: ["Quantity", "After activation"],
                      rows: [
                        ["Forget gate $f_2$", "[0.5734, 0.4441]"],
                        ["Input gate $i_2$", "[0.5198, 0.4272]"],
                        ["Candidate $\\tilde{c}_2$", "[−0.2518, −0.0823]"],
                        ["Cell state $C_2 = f_2 \\odot C_1 + i_2 \\odot \\tilde{c}_2$", "[−0.1658, −0.0013]"],
                        ["Output gate $o_2$", "[0.5623, 0.5595]"],
                        ["Hidden state $h_2 = o_2 \\odot \\tanh(C_2)$", "[−0.0924, −0.0007]"],
                      ],
                    },
                  ],
                },
                {
                  label: "Compare with the plain RNN",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "At $t = 1$ the plain RNN produced $h_1 = [0.4219, 0.2913]$ (Worked Example 1); the LSTM produces $h_1 = [-0.0304, 0.0483]$ from the **same input**. The values differ because the LSTM's gates are actively controlling how much new information enters the state — with these particular (untrained, illustrative) weights the gates happen to let relatively little through. After training on real data, the gates learn to open and close purposefully.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u3-l4-s5",
          title: "Why LSTM solves the vanishing gradient problem",
          blocks: [
            {
              type: "bullets",
              items: [
                "Recall that a plain RNN's gradient must pass through a **matrix multiply by $W_{hh}$ and a tanh derivative** at every single step — repeated many times, this shrinks (or explodes) exponentially.",
                "The LSTM cell-state recurrence is $C_t = f_t \\odot C_{t-1} + (\\text{new term})$ — this is **additive**, so $\\partial C_t/\\partial C_{t-1} = f_t$ (an element-wise scaling, **not** a matrix multiply followed by a squashing nonlinearity).",
                "If the forget gate learns to stay **close to 1** for information that should be remembered, the gradient can flow backward through many time steps with almost no shrinkage — an unimpeded **“gradient highway”** along the cell state.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "What this does — and does not — fix",
              blocks: [
                {
                  type: "text",
                  value:
                    "This does not eliminate vanishing gradients entirely (very long sequences can still be difficult, and the hidden-state path through tanh still exists), but it **dramatically extends how far back** an RNN-family model can learn useful dependencies — this is the single biggest reason LSTMs outperform plain RNNs in practice.",
                },
              ],
            },
          ],
        },
        {
          id: "u3-l4-s6",
          title: "Advantages and limitations",
          blocks: [
            {
              type: "compare",
              pairs: [
                {
                  label: "LSTM trade-offs",
                  left: [
                    "Learns long-range dependencies **far better** than a plain RNN.",
                    "The gating mechanism is **learned end-to-end from data** — no hand-designed memory rules.",
                    "Remains a **strong, well-understood baseline** for sequence tasks.",
                  ],
                  right: [
                    "Four sets of weights (forget, input, candidate, output) means roughly **4× the parameters** of a plain RNN of the same hidden size.",
                    "Inherently **sequential computation** makes it slower to train than fully parallel architectures such as Transformers.",
                    "Still **not immune to very long sequences** (hundreds/thousands of steps).",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u3-l5",
      title: "Gated Recurrent Unit (GRU)",
      subtitle: "Two gates, no separate cell state — the complete GRU worked example and the three-architecture comparison.",
      minutes: 14,
      sections: [
        {
          id: "u3-l5-s1",
          title: "Motivation",
          blocks: [
            {
              type: "bullets",
              items: [
                "Introduced by **Cho et al. (2014)**, the GRU asks: can we get most of the benefit of LSTM's gating — protection against vanishing gradients, learned control over memory — with a **simpler cell**?",
                "GRU merges the forget and input gates into a **single update gate**, and removes the separate cell state entirely — **the hidden state itself carries long-term memory**.",
                "Fewer gates means **fewer parameters** and typically **faster training**, while remaining competitive with LSTM on many tasks.",
              ],
            },
          ],
        },
        {
          id: "u3-l5-s2",
          title: "Architecture — two gates, one state",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Update gate $z_t$** — decides how much of the old hidden state to keep versus how much of the new candidate to mix in. It plays the combined role of LSTM's forget and input gates.",
                "**Reset gate $r_t$** — decides how much of the past hidden state to use when forming the new candidate content.",
                "**Candidate hidden state $\\tilde{h}_t$** — a proposed new hidden-state value, computed using the reset (partially forgotten) past state.",
                "**No separate cell state** — $h_t$ itself is the blend of old and new content.",
              ],
            },
            {
              type: "text",
              value:
                "In the GRU diagram, the final blend node interpolates between the old hidden state and the new candidate, controlled entirely by the update gate $z_t$.",
            },
            { type: "widget", widgetId: "u3-gru-lab", title: "GRU cell lab", description: "Toggle the update and reset gates and watch the final blend interpolate between the old hidden state and the new candidate." },
          ],
        },
        {
          id: "u3-l5-s3",
          title: "Equations and their significance",
          blocks: [
            {
              type: "formula",
              tex: "z_t = [\\,h_{t-1};\\; x_t\\,]",
              caption: "Concatenate the previous hidden state and the current input (same as LSTM)",
            },
            {
              type: "formula",
              tex: "z_t = \\sigma(W_z z_t + b_z)",
              caption: "Update gate — keep vs replace",
            },
            {
              type: "formula",
              tex: "r_t = \\sigma(W_r z_t + b_r)",
              caption: "Reset gate — how much past feeds the candidate",
            },
            {
              type: "formula",
              tex: "\\tilde{h}_t = \\tanh\\big(W_h\\,[\\,r_t \\odot h_{t-1};\\; x_t\\,] + b_h\\big)",
              caption: "Candidate hidden state — built from the reset past + current input",
            },
            {
              type: "formula",
              tex: "h_t = (1 - z_t) \\odot h_{t-1} + z_t \\odot \\tilde{h}_t",
              caption: "Final blend — a convex combination of old state and new candidate",
            },
            {
              type: "callout",
              variant: "info",
              title: "Notation caution",
              blocks: [
                {
                  type: "text",
                  value:
                    "The source notes use the symbol $z_t$ for both the concatenated input and the update gate — context keeps them apart. Where they must be distinguished (as in Worked Example 4), the concatenated input is written $z_t(\\text{input})$.",
                },
              ],
            },
            {
              type: "heading",
              value: "Significance of each equation",
            },
            {
              type: "bullets",
              items: [
                "**Update gate** — close to 0 keeps the old state almost unchanged; close to 1 replaces it almost entirely with the new candidate.",
                "**Reset gate** — close to 0 makes the candidate ignore the past and depend mostly on the current input (useful when starting a new, unrelated chunk of a sequence, e.g. a new sentence).",
                "**Final blend** — a **convex combination** (weights sum to 1) of old state and new candidate. Like the LSTM cell-state update, this blend is dominated by simple arithmetic rather than repeated matrix multiplication, which is what protects the gradient.",
              ],
            },
          ],
        },
        {
          id: "u3-l5-s4",
          title: "Worked Example 4 — GRU forward pass, step by step",
          blocks: [
            {
              type: "example",
              title: "Worked Example 4 — GRU forward pass (both time steps)",
              given: [
                "Same two inputs again, for direct comparison with the RNN and LSTM examples: $x_1 = [1.0000, 0.5000]$, $x_2 = [0.5000, -1.0000]$",
                "Initial hidden state: $h_0 = [0.0000, 0.0000]$",
                "$W_z = [[0.2, -0.1, 0.3, 0.1], [0.1, 0.3, -0.2, 0.2]]$, $b_z = [0.1000, 0.0000]$",
                "$W_r = [[0.4, 0.2, -0.1, 0.3], [-0.2, 0.1, 0.2, -0.3]]$, $b_r = [0.0000, 0.1000]$",
                "$W_h = [[0.3, -0.2, 0.4, 0.1], [0.2, 0.1, -0.3, 0.2]]$, $b_h = [0.1000, -0.1000]$",
              ],
              steps: [
                {
                  label: "Step 1.1 — Build the concatenated input",
                  blocks: [
                    { type: "formula", tex: "z_1(\\text{input}) = [h_0; x_1] = [0, 0, 1.0, 0.5]" },
                  ],
                },
                {
                  label: "Step 1.2 — Update gate",
                  blocks: [
                    { type: "formula", tex: "W_z z_1 + b_z = (0.35, -0.10) + (0.1, 0.0) = (0.45, -0.10) \\;\\Rightarrow\\; z_1 = \\sigma(0.45, -0.10) = [0.6106, 0.4750]" },
                  ],
                },
                {
                  label: "Step 1.3 — Reset gate",
                  blocks: [
                    { type: "formula", tex: "W_r z_1 + b_r = (0.05, 0.05) + (0.0, 0.1) = (0.05, 0.15) \\;\\Rightarrow\\; r_1 = \\sigma(0.05, 0.15) = [0.5125, 0.5374]" },
                  ],
                },
                {
                  label: "Step 1.4 — Apply the reset gate to the past state",
                  blocks: [
                    { type: "formula", tex: "r_1 \\odot h_0 = [0.5125, 0.5374] \\odot [0.0000, 0.0000] = (0, 0)" },
                    {
                      type: "text",
                      value:
                        "With $h_0 = 0$ there is nothing to reset yet, so this step has no visible effect at $t = 1$ (its role becomes clear at $t = 2$).",
                    },
                  ],
                },
                {
                  label: "Step 1.5 — Candidate hidden state",
                  blocks: [
                    { type: "formula", tex: "W_h\\,[r_1 \\odot h_0; x_1] + b_h = (0.45, -0.20) + (0.1, -0.1) = (0.55, -0.30) \\;\\Rightarrow\\; \\tilde{h}_1 = \\tanh(0.55, -0.30) = [0.5005, -0.2913]" },
                  ],
                },
                {
                  label: "Step 1.6 — Final blend (this is $h_1$)",
                  blocks: [
                    { type: "formula", tex: "h_1 = (1 - z_1) \\odot h_0 + z_1 \\odot \\tilde{h}_1 = (1 - [0.6106, 0.4750]) \\odot [0.0000, 0.0000] + [0.6106, 0.4750] \\odot [0.5005, -0.2913]" },
                    { type: "formula", tex: "= [0.3056, -0.1384]" },
                    {
                      type: "text",
                      value:
                        "Because $h_0 = 0$, the first term vanishes and $h_1$ is simply $z_1 \\odot \\tilde{h}_1$ — the update gate scales down how much of the fresh candidate is accepted.",
                    },
                  ],
                },
                {
                  label: "Time step $t = 2$ (now the reset gate has something to act on)",
                  blocks: [
                    { type: "formula", tex: "z_2(\\text{input}) = [h_1; x_2] = [0.3056, -0.1384, 0.5000, -1.0000]" },
                    {
                      type: "table",
                      headers: ["Quantity", "After activation", "Interpretation"],
                      rows: [
                        ["Update gate $z_2$", "[0.5560, 0.4229]", "how much of $h_1$ to overwrite"],
                        ["Reset gate $r_2$", "[0.4365, 0.6047]", "how much of $h_1$ to use when building the candidate"],
                        ["$r_2 \\odot h_1$", "[0.1334, −0.0837]", "the gated (partially forgotten) past state"],
                        ["Candidate $\\tilde{h}_2$", "[0.2513, −0.4067]", "proposed new content"],
                        ["$h_2 = (1 - z_2) \\odot h_1 + z_2 \\odot \\tilde{h}_2$", "[0.2754, −0.2519]", "final blended state"],
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u3-l5-s5",
          title: "Compare the three architectures at t = 1",
          blocks: [
            {
              type: "text",
              value:
                "Same input $x_1$, same hidden size, three different results — each architecture combines the input differently because each has a different internal gating structure (this is Practice Question 21):",
            },
            {
              type: "table",
              headers: ["Architecture", "$h_1$ from the same $x_1 = [1.0, 0.5]$", "What stands between $x_1$ and $h_1$"],
              rows: [
                ["Plain RNN", "[0.4219, 0.2913]", "Nothing — a direct, ungated transformation of the input"],
                ["LSTM", "[−0.0304, 0.0483]", "Two learned filters — the input gate scales what is written, the output gate scales what is exposed"],
                ["GRU", "[0.3056, −0.1384]", "One learned filter — the single update gate scales how much of the candidate is accepted"],
              ],
            },
            {
              type: "text",
              value:
                "All three use the same raw input $x_1$, but the RNN applies no learned gating, while LSTM and GRU each pass the resulting candidate through one or more sigmoid gates before it becomes $h_1$ — with untrained (illustrative) weights these gates simply produce different numbers than the ungated RNN. After training, this gating is precisely what lets LSTM/GRU learn **when** to accept new information.",
            },
          ],
        },
        {
          id: "u3-l5-s6",
          title: "GRU vs LSTM",
          blocks: [
            {
              type: "bullets",
              items: [
                "**No output gate** — the full hidden state is always exposed (LSTM can hide part of its cell state from the output via the output gate).",
                "**No separate cell state** — memory and output are the same vector, which simplifies the design but gives slightly less representational flexibility.",
                "**One combined update gate** where LSTM uses two independent gates (forget, input) — fewer parameters, slightly less fine-grained control.",
                "In practice, the two perform **comparably** on many tasks; GRU is often preferred when training speed / parameter budget matters, LSTM when maximum modelling flexibility is preferred. **Both comfortably outperform a plain RNN** on long sequences.",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u3-l6",
      title: "RNN Language Models",
      subtitle: "Embedding → recurrence → softmax read-out: the complete next-word prediction example, cross-entropy and perplexity.",
      minutes: 14,
      sections: [
        {
          id: "u3-l6-s1",
          title: "What is a language model?",
          blocks: [
            {
              type: "text",
              value:
                "A **language model** assigns a probability to sequences of words, or equivalently, predicts a **probability distribution over the next word** given all the words seen so far. Formally, for a sequence of words $w_1, \\dots, w_T$, a language model estimates:",
            },
            {
              type: "formula",
              tex: "P(w_1, \\dots, w_T) = P(w_1) \\cdot P(w_2 \\mid w_1) \\cdot P(w_3 \\mid w_1, w_2) \\cdots P(w_T \\mid w_1, \\dots, w_{T-1})",
              caption: "The chain-rule factorisation every language model approximates",
            },
            {
              type: "text",
              value:
                "Language models power autocomplete, text generation, machine translation (as the decoder), speech recognition (choosing the most fluent transcription), and are the training objective behind today's large language models.",
            },
          ],
        },
        {
          id: "u3-l6-s2",
          title: "An RNN as a language model — architecture",
          blocks: [
            {
              type: "numbered",
              items: [
                "**Step 1 — Embedding:** each word is converted from a discrete token into a dense vector (a row of a learned embedding matrix $E$).",
                "**Step 2 — Recurrence:** the embedding is fed into the RNN (or LSTM / GRU) exactly as in the earlier lessons; the hidden state accumulates context from every word seen so far.",
                "**Step 3 — Read-out:** at every time step, the hidden state is projected to a vector of logits, one per vocabulary word, and passed through softmax to obtain a probability distribution over the next word.",
              ],
            },
            {
              type: "text",
              value:
                "**Training:** at each step, the true next word is compared against the predicted distribution using **cross-entropy loss**; the same shared weights are updated via **BPTT**, exactly as in the BPTT lesson.",
            },
            {
              type: "callout",
              variant: "tip",
              title: "Only the ends are new",
              blocks: [
                {
                  type: "text",
                  value:
                    "Unrolled across time steps, an RNN language model reuses the same RNN weights from the plain-RNN lesson — only the input side (word embeddings) and the output side (softmax over the vocabulary) are new. The recurrence itself never changes.",
                },
              ],
            },
          ],
        },
        {
          id: "u3-l6-s3",
          title: "Equations and their significance",
          blocks: [
            {
              type: "formula",
              tex: "e_t = E[w_t]",
              caption: "Look up the embedding row for the current word",
            },
            {
              type: "formula",
              tex: "a_t = W_{xh}\\,e_t + W_{hh}\\,h_{t-1} + b_h, \\qquad h_t = \\tanh(a_t)",
              caption: "The same recurrence as before, now driven by embeddings",
            },
            {
              type: "formula",
              tex: "\\text{logits}_t = W_{hy}\\,h_t + b_y",
              caption: "Project the hidden state to vocabulary-sized logits",
            },
            {
              type: "formula",
              tex: "P(\\text{word} \\mid \\text{context}) = \\text{softmax}(\\text{logits}_t)",
              caption: "A probability distribution over the next word",
            },
            {
              type: "formula",
              tex: "L_t = -\\log P(w_{t+1} = \\text{target} \\mid \\text{context})",
              caption: "Cross-entropy loss at step t",
            },
            {
              type: "heading",
              value: "Significance",
            },
            {
              type: "bullets",
              items: [
                "**Embedding lookup** turns a discrete word into a point in continuous space, where similar words can end up close together after training.",
                "**Softmax** converts raw logits into a valid probability distribution (non-negative, sums to 1) over the entire vocabulary.",
                "**Cross-entropy loss** penalises the model in proportion to how surprised it was by the true next word — a confident wrong prediction is penalised heavily; a confident correct prediction has almost no loss.",
              ],
            },
            { type: "widget", widgetId: "u3-lm-lab", title: "Language model lab", description: "Feed words through the embedding, recurrence and softmax read-out; watch next-word probabilities, cross-entropy loss and perplexity react." },
          ],
        },
        {
          id: "u3-l6-s4",
          title: "Worked Example 5 — next-word prediction, step by step",
          blocks: [
            {
              type: "example",
              title: "Worked Example 5 — next-word prediction over a 4-word vocabulary",
              given: [
                "Toy vocabulary (4 words): {I, love, deep, learning}, indices 0–3.",
                "Embedding table $E$ (one row per word): I → [0.1000, 0.2000], love → [0.3000, -0.1000], deep → [-0.2000, 0.4000], learning → [0.5000, 0.1000]",
                "Recurrence weights: the same $W_{xh}$, $W_{hh}$, $b_h$ from Worked Example 1 — re-used here to show that the recurrence itself is identical; only the surrounding embedding/read-out layers are new.",
                "Read-out weights: $W_{hy}^{(lm)} = [[0.2, 0.1], [0.1, -0.2], [-0.3, 0.4], [0.4, 0.2]]$, $b_y^{(lm)} = [0.0000, 0.0000, 0.0000, 0.1000]$",
                "Training sentence: “I love deep learning” → input/target pairs (I → love), (love → deep)",
              ],
              steps: [
                {
                  label: "Step 1.1 — Embed the input word (t = 1: input = “I”, target = “love”)",
                  blocks: [
                    { type: "formula", tex: "e_1 = E[\\text{I}] = [0.1000, 0.2000]" },
                  ],
                },
                {
                  label: "Step 1.2 — Update the hidden state (identical recurrence to Worked Example 1)",
                  blocks: [
                    { type: "formula", tex: "a_1 = W_{xh}e_1 + W_{hh}h_0 + b_h = [0.0900, 0.0000] \\;\\Rightarrow\\; h_1 = \\tanh([0.0900, 0.0000]) = [0.0898, 0.0000]" },
                  ],
                },
                {
                  label: "Step 1.3 — Project to vocabulary-sized logits",
                  blocks: [
                    { type: "formula", tex: "\\text{logits}_1 = W_{hy}^{(lm)}h_1 + b_y^{(lm)} = [0.0180, 0.0090, -0.0269, 0.1359]" },
                  ],
                },
                {
                  label: "Step 1.4 — Softmax → probability distribution over the 4 words",
                  blocks: [
                    { type: "formula", tex: "P = \\text{softmax}([0.0180, 0.0090, -0.0269, 0.1359]) = [0.2456, 0.2434, 0.2348, 0.2763]" },
                    {
                      type: "text",
                      value:
                        "Reading the entries in vocabulary order — I: 0.2456, love: 0.2434, deep: 0.2348, learning: 0.2763.",
                    },
                  ],
                },
                {
                  label: "Step 1.5 — Cross-entropy loss against the true next word “love”",
                  blocks: [
                    { type: "formula", tex: "L_1 = -\\log P(\\text{love}) = -\\log(0.2434) = 1.4132" },
                    {
                      type: "callout",
                      variant: "info",
                      title: "Reading the result",
                      blocks: [
                        {
                          type: "text",
                          value:
                            "All four probabilities came out close to 0.25 (i.e. close to uniform / random guessing) — unsurprising, since these are **untrained, illustrative weights**, not weights learned from real text. Training would push P(love) toward 1 for this context by adjusting every weight along the BPTT gradient path.",
                        },
                      ],
                    },
                  ],
                },
                {
                  label: "Time step t = 2: input = “love”, target = “deep”",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "The hidden state now carries forward information from “I” as well:",
                    },
                    {
                      type: "table",
                      headers: ["Quantity", "Value"],
                      rows: [
                        ["$e_2 = E[\\text{love}]$", "[0.3000, −0.1000]"],
                        ["$a_2 = W_{xh}e_2 + W_{hh}h_1 + b_h$", "[0.2890, −0.0980]"],
                        ["$h_2 = \\tanh(a_2)$", "[0.2812, −0.0976]"],
                        ["$\\text{logits}_2 = W_{hy}^{(lm)}h_2 + b_y^{(lm)}$", "[0.0465, 0.0476, −0.1234, 0.1929]"],
                        ["$P$ (I, love, deep, learning)", "[0.2498, 0.2501, 0.2108, 0.2892]"],
                        ["$L_2 = -\\log P(\\text{deep})$", "1.5569"],
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "u3-l6-s5",
          title: "Perplexity",
          blocks: [
            {
              type: "text",
              value:
                "**Perplexity** is the standard way to report how well a language model predicts text; it converts the average cross-entropy loss back onto an intuitive scale:",
            },
            {
              type: "formula",
              tex: "\\text{Average loss} = \\frac{L_1 + L_2 + \\cdots}{T}",
              caption: "Mean cross-entropy over the T prediction steps",
            },
            {
              type: "formula",
              tex: "\\text{Perplexity} = \\exp(\\text{Average loss})",
              caption: "The exponentiated average loss",
            },
            {
              type: "example",
              title: "Perplexity of Worked Example 5",
              steps: [
                {
                  label: "Average loss",
                  blocks: [
                    { type: "formula", tex: "\\text{Average loss} = \\frac{1.4132 + 1.5569}{2} = 1.4850" },
                  ],
                },
                {
                  label: "Perplexity",
                  blocks: [
                    { type: "formula", tex: "\\text{Perplexity} = \\exp(1.4850) = 4.4151" },
                  ],
                },
                {
                  label: "Interpretation",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "A perplexity of 4.42 means the model is, on average, about as “confused” as if it were guessing uniformly at random among roughly **4.4 equally likely words** — out of a 4-word vocabulary, that is only slightly better than pure guessing (perplexity 4.0), consistent with these being untrained weights.",
                    },
                  ],
                },
              ],
            },
            {
              type: "bullets",
              items: [
                "**Lower perplexity = better model.** A well-trained model on a large vocabulary typically achieves a perplexity far below the vocabulary size, because it learns to concentrate probability mass on plausible next words.",
                "**Perplexity = 1** would mean the model is always 100% certain and always correct (the theoretical best); **perplexity equal to the vocabulary size** corresponds to uniform random guessing (the practical worst case for a sensible model).",
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Exam point — the perplexity formula",
              blocks: [
                {
                  type: "text",
                  value:
                    "Perplexity $= \\exp(\\text{average cross-entropy loss})$. It maps loss $= 0$ (a perfect model) to perplexity $= 1$, and grows exponentially with the loss, giving the intuitive “effective number of equally likely choices” interpretation. Memorise the two anchors: **1 is best, vocabulary size is the uniform-guessing worst case**.",
                },
              ],
            },
          ],
        },
        {
          id: "u3-l6-s6",
          title: "Beyond the basics",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Teacher forcing** — during training, the true previous word is fed as input at every step (as in Worked Example 5), even if the model's own previous prediction was wrong; this stabilises and speeds up training.",
                "**Generation / sampling** — at inference time there is no “true” next word, so the model's own output is fed back as the next input. Common strategies: **greedy decoding** (always pick the highest-probability word), **sampling with temperature**, and **beam search**.",
                "**LSTM / GRU language models** — in practice, the plain-RNN recurrence in this lesson is almost always replaced by an LSTM or GRU cell, since long documents need the improved long-range memory.",
                "**Modern context** — Transformer-based language models have largely superseded RNN-based ones for state-of-the-art results, but the evaluation concepts introduced here — next-word prediction, cross-entropy loss, and perplexity — remain exactly the same and are used to evaluate Transformer language models too.",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u3-l7",
      title: "Choosing: RNN vs LSTM vs GRU",
      subtitle: "The structural comparison, the parameter-count formulas every exam loves, and when to use which architecture.",
      minutes: 9,
      sections: [
        {
          id: "u3-l7-s1",
          title: "Structural comparison",
          blocks: [
            { type: "widget", widgetId: "u3-compare", title: "RNN vs LSTM vs GRU", description: "Compare memory, gates, update rules, gradient flow, parameter counts and training speed across the three recurrent architectures, side by side." },
            {
              type: "table",
              headers: ["Feature", "Plain RNN", "LSTM", "GRU"],
              rows: [
                ["Memory", "Hidden state $h_t$ only", "Cell state $C_t$ + hidden state $h_t$", "Hidden state $h_t$ only (no separate cell state)"],
                ["Gates", "None", "3 (forget, input, output)", "2 (update, reset)"],
                ["Update rule", "Fully overwritten every step (through tanh)", "Additive, gated", "Convex blend, gated"],
                ["Gradient flow", "Repeated matrix multiply → vanishes/explodes", "Protected by additive cell-state highway", "Protected by the blend / update gate"],
                ["Relative parameter count (same hidden size)", "1×", "≈ 4×", "≈ 3×"],
                ["Typical training speed", "Fastest per step, hardest to train well on long sequences", "Slower per step", "Slightly faster than LSTM per step"],
              ],
              caption: "Structural comparison of the three recurrent architectures.",
            },
          ],
        },
        {
          id: "u3-l7-s2",
          title: "Parameter-count formulas",
          blocks: [
            {
              type: "text",
              value:
                "For input size $d$ and hidden size $h$, counting every weight matrix and bias:",
            },
            {
              type: "table",
              headers: ["Architecture", "Parameter count formula", "Example: $d = 100$, $h = 128$"],
              rows: [
                ["RNN", "$h(d + h + 1)$", "29,312"],
                ["LSTM", "$4 \\times h(d + h + 1)$", "117,248 (= 4 × RNN)"],
                ["GRU", "$3 \\times h(d + h + 1)$", "87,936 (= 3 × RNN)"],
              ],
            },
            {
              type: "example",
              title: "Where the numbers come from",
              steps: [
                {
                  label: "The RNN formula, term by term",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "$h \\times d$ counts the entries of $W_{xh}$ (input → hidden), $h \\times h$ counts the entries of $W_{hh}$ (hidden → hidden), and $h$ counts the bias vector $b_h$ (one bias per hidden unit): $h\\times d + h\\times h + h = h(d + h + 1)$. This counts only the recurrent layer — a separate output layer $W_{hy}, b_y$ would add $h \\times (\\text{output size}) + (\\text{output size})$ more.",
                    },
                  ],
                },
                {
                  label: "Check with $d = 100$, $h = 128$",
                  blocks: [
                    { type: "formula", tex: "h(d + h + 1) = 128 \\times (100 + 128 + 1) = 128 \\times 229 = 29{,}312" },
                    { type: "formula", tex: "\\text{LSTM} = 4 \\times 29{,}312 = 117{,}248, \\qquad \\text{GRU} = 3 \\times 29{,}312 = 87{,}936" },
                  ],
                },
              ],
            },
            {
              type: "bullets",
              items: [
                "The “4×” and “3×” factors come directly from **counting gates**: LSTM has **4 sets of weights** (forget, input, candidate, output), all sharing the same input shape $(d + h) \\to h$; GRU has **3** (update, reset, candidate).",
                "This is why, for a fixed parameter budget, a GRU can afford a **larger hidden size** than an LSTM.",
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Exam point — memorise all three formulas",
              blocks: [
                {
                  type: "text",
                  value:
                    "RNN: $h(d+h+1)$ — LSTM: $4h(d+h+1)$ — GRU: $3h(d+h+1)$. Exam favourites ask you to substitute values, e.g. an LSTM with $d = 50$, $h = 32$ has $4 \\times 32 \\times 83 = 10{,}624$ parameters, and a GRU with $d = 64$, $h = 48$ has $3 \\times 48 \\times 113 = 16{,}272$ (Practice Questions 35 and 42). Also remember the ratios: LSTM ≈ 4× a plain RNN, GRU ≈ 3×.",
                },
              ],
            },
          ],
        },
        {
          id: "u3-l7-s3",
          title: "When to use which",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Plain RNN** — short sequences, when simplicity/speed matters more than long-range memory, or as a teaching baseline. Rarely the best choice for real long-sequence tasks.",
                "**LSTM** — tasks needing the most reliable long-range memory and fine-grained control (separately tunable forget/input/output behaviour); a strong default when compute budget is not tight.",
                "**GRU** — a strong default when training speed or parameter budget is constrained (e.g. mobile/embedded, very large hidden sizes, limited data); frequently matches LSTM accuracy with fewer resources.",
                "**Neither, in modern large-scale NLP** — Transformer-based architectures have largely replaced all three for state-of-the-art language tasks, because they parallelise across time (faster training) and use attention instead of a single recurrent bottleneck. RNN/LSTM/GRU remain important for **streaming/online settings, resource-constrained devices**, and as the conceptual foundation for sequence modelling.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "The historical thread: RNN → LSTM → GRU → Transformer",
              blocks: [
                {
                  type: "text",
                  value:
                    "RNN introduced parameter sharing across time via a recurrent hidden state, solving the fixed-input-size and no-memory problems of feedforward networks. LSTM added gated, additive memory (the cell state) specifically to fix the vanishing gradient. GRU simplified LSTM's gating (2 gates instead of 3, no separate cell state) to reduce parameters and training cost while keeping most of the benefit. Transformers replaced recurrence entirely with self-attention, removing the sequential bottleneck and giving a more direct path between distant positions. Each step pursued the same underlying goal: **let information from arbitrarily far back in a sequence influence the current prediction, as efficiently as possible**.",
                },
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u3-check-3",
                  question: "A GRU layer has input size $d$ and hidden size $h$. How many trainable parameters does the recurrent layer have?",
                  options: [
                    "$h(d+h+1)$",
                    "$2h(d+h+1)$",
                    "$3h(d+h+1)$",
                    "$4h(d+h+1)$",
                  ],
                  correct: 2,
                  explanation:
                    "A GRU computes three gated quantities from the same concatenated input — update gate, reset gate and candidate — so its parameter count is 3 × h(d+h+1), three times a plain RNN's. The 4× version is the LSTM, which computes four (forget, input, candidate, output).",
                },
                {
                  id: "u3-check-4",
                  question:
                    "You must build a next-word predictor for a mobile keyboard under a tight compute and parameter budget. Which architecture is the most natural first choice?",
                  options: [
                    "Plain RNN, because it is always the most accurate on text",
                    "LSTM, because more gates are always better",
                    "GRU, because it often matches LSTM accuracy with roughly 25% fewer parameters",
                    "Encoder–decoder, because keyboards are sequence-to-sequence",
                  ],
                  correct: 2,
                  explanation:
                    "GRU keeps most of LSTM's long-range memory benefit with ≈ 3× (versus 4×) the parameters of a plain RNN, and trains slightly faster per step — a strong default when speed or parameter budget is constrained (mobile/embedded, large hidden sizes, limited data). A plain RNN would struggle with the long-range dependencies text needs.",
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
      id: "u3-q1",
      question: "Which of the following is NOT a defining property of sequential data?",
      options: [
        "Every sequence in the dataset must have exactly the same length",
        "The order of elements affects the meaning",
        "Later elements can depend on much earlier elements",
        "Elements are not statistically independent of their neighbours",
      ],
      correct: 0,
      explanation:
        "Sequential data is explicitly allowed to be of variable length — sentences, audio clips and time series routinely differ in length. This variability is precisely why ordinary feedforward networks (which need a fixed-size input) struggle with sequences, and why RNNs, which process one element at a time and share weights across positions, are needed. Options B, C and D all describe real properties of sequential data.",
    },
    {
      id: "u3-q2",
      question:
        "What is the single most important structural idea that lets an RNN process sequences of any length using a fixed number of parameters?",
      options: [
        "Using convolutional filters that slide over the input",
        "Increasing the hidden size whenever the sequence is longer",
        "Sharing the same weight matrices across all time steps",
        "Training a separate small network for every time step",
      ],
      correct: 2,
      explanation:
        "Because Wxh, Whh, Why (and their biases) are reused, identically, at every time step, the total number of parameters does not grow with sequence length — a 5-word sentence and a 500-word document are processed by exactly the same set of weights, applied repeatedly. Option D is effectively the opposite of parameter sharing and would not generalise to unseen lengths.",
    },
    {
      id: "u3-q3",
      question: "In the standard update h\u209c = tanh(W\u2093\u2093x\u209c + W\u2095\u2095h\u209c\u208b\u2081 + b\u2095), every component of h\u209c must lie in which range?",
      options: ["(−1, 1)", "(0, 1)", "(−∞, ∞)", "[0, ∞)"],
      correct: 0,
      explanation:
        "tanh squashes any real-valued input into the open interval (−1, 1). (0, 1) is the range of the sigmoid function instead, which is used inside LSTM/GRU gates, not the plain RNN hidden-state update.",
    },
    {
      id: "u3-q4",
      question: "If a pre-activation value a = 0, what are tanh(a) and its local derivative 1 − tanh²(a) at that point?",
      options: ["0 and 0", "1 and 0", "1 and 1", "0 and 1"],
      correct: 3,
      explanation:
        "tanh(0) = 0, and 1 − tanh²(0) = 1 − 0 = 1. This is the largest possible value the tanh-derivative factor can take (it is always ≤ 1) — so even in the best case, each backward step through tanh cannot amplify the gradient, only preserve or shrink it. This is the local mechanism underlying the vanishing-gradient problem.",
    },
    {
      id: "u3-q5",
      question: "In BPTT for a plain RNN, the total gradient of the loss with respect to Whh is obtained by:",
      options: [
        "Summing the gradient contributions from every time step",
        "Using only the gradient contribution from the final time step",
        "Averaging the contributions from only the first and last time steps",
        "Taking the single largest contribution across all time steps",
      ],
      correct: 0,
      explanation:
        "Because Whh is reused at every step, the multivariable chain rule requires summing its gradient contribution from every time step it was used in: ∂L/∂Whh = Σₜ ∂L/∂aₜ ⊗ hₜ₋₁ (demonstrated numerically in Worked Example 2).",
    },
    {
      id: "u3-q6",
      question: "The vanishing gradient problem in plain RNNs is primarily caused by:",
      options: [
        "Using too few hidden units",
        "Using too large a learning rate",
        "The softmax function saturating",
        "Repeated multiplication by Whhᵀ and a tanh-derivative factor (≤ 1) at every backward step",
      ],
      correct: 3,
      explanation:
        "Backpropagating through T time steps multiplies the gradient by roughly T copies of Whhᵀ and a tanh-derivative factor. If the typical size of this product (informally λ) is less than 1, the gradient shrinks exponentially with T. This has nothing to do with the learning rate or softmax, and too few hidden units is a capacity problem, not a gradient-flow problem.",
    },
    {
      id: "u3-q7",
      question: "Which technique is the standard, simplest fix specifically aimed at exploding gradients?",
      options: ["Gradient clipping", "Dropout", "Batch normalisation", "Data augmentation"],
      correct: 0,
      explanation:
        "Gradient clipping directly rescales the gradient vector when its norm exceeds a chosen threshold, capping the size of any single update — a direct, minimal-assumption fix for exploding gradients. Dropout and data augmentation address overfitting, not gradient explosion; batch normalisation targets internal covariate shift in deep feedforward stacks.",
    },
    {
      id: "u3-q8",
      question: "How many gate values does a standard LSTM cell compute at each time step?",
      options: ["1", "3", "2", "4"],
      correct: 1,
      explanation:
        "An LSTM has exactly three gates: forget (fₜ), input (iₜ), and output (oₜ) — each a sigmoid, each genuinely “gating” (scaling) something. The candidate c̃ₜ is also computed from the same weights but is not a gate: it uses tanh and proposes new content rather than deciding how much of something to let through. This distinction is a common point of confusion.",
    },
    {
      id: "u3-q9",
      question: "A forget-gate value f\u209c close to 0 for a particular memory component means:",
      options: [
        "That component of the old cell state is almost entirely kept",
        "The input gate is automatically forced to 0",
        "That component of the old cell state is almost entirely erased",
        "The output gate closes for that component",
      ],
      correct: 2,
      explanation:
        "Cₜ = fₜ ⊙ Cₜ₋₁ + (new term); when fₜ ≈ 0 for a component, that component of Cₜ₋₁ is multiplied by ≈ 0 and is therefore erased from the running memory. The forget and input gates are computed independently (different weights), so option B is false in general.",
    },
    {
      id: "u3-q10",
      question: "The main reason the LSTM cell state protects gradients from vanishing is that its update rule is:",
      options: [
        "Multiplicative and passed through tanh at every step, like a plain RNN",
        "Computed only once, at the final time step",
        "Identical in form to the plain RNN's hidden-state update",
        "Additive and mostly element-wise, with no repeated matrix multiply on the main path",
      ],
      correct: 3,
      explanation:
        "Cₜ = fₜ ⊙ Cₜ₋₁ + iₜ ⊙ c̃ₜ is additive, so ∂Cₜ/∂Cₜ₋₁ = fₜ (an element-wise scaling), not a matrix multiplication followed by a squashing nonlinearity. If fₜ stays near 1, gradients can flow across many steps with minimal shrinkage — the “gradient highway” idea.",
    },
    {
      id: "u3-q11",
      question: "How many gates does a standard GRU have?",
      options: ["1", "3", "2", "4"],
      correct: 2,
      explanation:
        "A GRU has exactly two gates: the update gate zₜ and the reset gate rₜ. This is one fewer gate-type than LSTM's three, which is the direct source of GRU's smaller parameter count (≈ 3× a plain RNN, versus ≈ 4× for LSTM).",
    },
    {
      id: "u3-q12",
      question: "Which statement about the GRU is correct?",
      options: [
        "GRU has a separate cell state distinct from its hidden state",
        "GRU merges the roles of LSTM's forget and input gates into a single update gate",
        "GRU has more parameters than an LSTM of the same hidden size",
        "GRU has an explicit output gate, exactly like LSTM",
      ],
      correct: 1,
      explanation:
        "The update gate zₜ controls the blend hₜ = (1−zₜ)⊙hₜ₋₁ + zₜ⊙h̃ₜ — zₜ acting large plays the role of LSTM's input gate (write new content), and (1−zₜ) acting large plays the role of the forget gate (keep old content), combined into one gate. GRU has no separate cell state (A is false), fewer parameters than LSTM (C is false), and no output gate (D is false).",
    },
    {
      id: "u3-q13",
      question: "In an RNN language model, the softmax layer at each time step outputs:",
      options: [
        "The next hidden state directly",
        "The embedding vector of the input word",
        "A probability distribution over the vocabulary for the next word",
        "The scalar cross-entropy loss value",
      ],
      correct: 2,
      explanation:
        "softmax(logitsₜ) converts the raw, unbounded logits into non-negative values that sum to 1 — a valid probability distribution over every word in the vocabulary. The loss is computed from this distribution afterward, using the true next word.",
    },
    {
      id: "u3-q14",
      question: "If a language model's average cross-entropy loss on a test set is L, its perplexity is:",
      options: ["L²", "1 / L", "log(L)", "exp(L)"],
      correct: 3,
      explanation:
        "Perplexity = exp(average cross-entropy loss). This maps loss = 0 (a perfect model) to perplexity = 1, and increases perplexity exponentially as the average loss increases, giving a more intuitive “effective number of choices” interpretation than the raw loss.",
    },
    {
      id: "u3-q15",
      question: "For the same input size and hidden size, an LSTM has approximately how many times the number of parameters of a plain RNN?",
      options: ["1×", "4×", "2×", "3×"],
      correct: 1,
      explanation:
        "A plain RNN has one set of weights of shape h×(d+h) plus a bias; an LSTM computes four such quantities (forget, input, candidate, output) from the same input shape, so its parameter count is 4 × h(d+h+1) versus h(d+h+1) for the RNN — exactly 4×. GRU, with 3 such computations, is ≈ 3×.",
    },
  ],
};
