import type { Unit } from "@/lib/content/types";

export const u4: Unit = {
  id: "u4",
  number: 4,
  code: "UNIT 4",
  title: "Deep Unsupervised Learning",
  subtitle: "Autoencoders · VAE · GAN · Max Entropy · RBM · DBN · DBM · ConvBM",
  description:
    "Learn from data that has no labels: compress it through bottlenecks, generate new samples with VAEs and GANs, and master the energy-based family — RBM, DBN, DBM and Convolutional BM — with every derivation and worked example from the notes.",
  sourceFile: "CCE3144_Deep_Unsupervised_Learning_Unit4.pdf",
  topics: ["Autoencoders & VAE", "GANs", "Maximum Entropy", "RBM · DBN · DBM · ConvBM"],
  lessons: [
    /* ---------------------------------------------------------------- */
    {
      id: "u4-l1",
      title: "Deep Unsupervised Learning — The Landscape",
      subtitle: "No labels, no problem — discovering structure in raw data, and why depth is the key to modelling it.",
      minutes: 9,
      sections: [
        {
          id: "u4-l1-s1",
          title: "What is unsupervised learning?",
          blocks: [
            {
              type: "text",
              value:
                "This unit leaves the world of labels behind. **Unsupervised learning** learns from data $x$ that has **no labels $y$** — only the inputs are given, no “correct answer” is supplied.",
            },
            {
              type: "bullets",
              items: [
                "**Goal:** discover hidden structure, patterns, or the underlying probability distribution $p(x)$ that generated the data.",
                "**Classical examples:** k-means clustering, PCA, hierarchical clustering — but these use shallow, hand-designed feature spaces.",
                "**Contrast with supervised learning:** there is no loss like cross-entropy against a ground-truth label; the “supervision” instead comes from the data itself (e.g. reconstruct the input, distinguish real vs. fake, model the data density).",
              ],
            },
            {
              type: "table",
              headers: ["Where the training signal comes from", "Supervised learning", "Unsupervised learning (this unit)"],
              rows: [
                ["Target", "A known label $y$ for every input $x$", "No labels — the data itself is the target"],
                ["Typical loss", "Cross-entropy / MSE against $y$", "Reconstruction error, an adversarial game, or the energy / likelihood of $x$"],
                ["What is learned", "A mapping $f: x \\to y$", "Structure: a code, a sampler, or a model of $p(x)$"],
              ],
              caption: "In every model of this unit the “label” is manufactured from the input itself.",
            },
          ],
        },
        {
          id: "u4-l1-s2",
          title: "Why “deep” unsupervised learning?",
          blocks: [
            {
              type: "bullets",
              items: [
                "Classical methods (PCA, k-means) can only capture **linear / shallow structure**.",
                "Real data (images, speech, text) lies on **complex, non-linear low-dimensional manifolds** inside a high-dimensional space.",
                "Deep neural networks, stacked in multiple layers, learn a **hierarchy of features** — simple patterns in early layers combine into abstract concepts in later layers — exactly what is needed to model such manifolds.",
                "This hierarchy is learned **automatically from unlabelled data**, which is abundant, instead of requiring expensive manual labelling.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "The deep unsupervised promise",
              blocks: [
                {
                  type: "text",
                  value:
                    "A shallow model can only compress or cluster linearly. A deep model can bend, fold and abstract — tracing the curved manifold the data actually lives on, layer by layer, without ever seeing a single label.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l1-s3",
          title: "Why we care — applications",
          blocks: [
            {
              type: "table",
              headers: ["Application", "What it delivers", "Models in this unit"],
              rows: [
                ["Representation / feature learning", "Features for downstream supervised tasks (pre-training)", "Autoencoders, RBM, DBN"],
                ["Data generation", "Synthesising realistic images, audio, text", "GANs, VAEs"],
                ["Dimensionality reduction, denoising, anomaly detection", "Compact codes, clean inputs, outlier flags", "Autoencoders"],
                ["Density estimation", "Learning $p(x)$ explicitly — compute likelihoods, detect outliers", "RBM, DBN, DBM"],
                ["Data compression and efficient coding", "Small codes that preserve what matters", "Autoencoders, RBMs"],
              ],
            },
          ],
        },
        {
          id: "u4-l1-s4",
          title: "Roadmap — the model families and the one unifying idea",
          blocks: [
            {
              type: "widget",
              widgetId: "u4-model-map",
              title: "The deep unsupervised learning landscape",
              description:
                "Explore the model families of this unit, grouped by how they learn p(x) — compression, adversarial games, maximum entropy, and energy functions.",
            },
            {
              type: "callout",
              variant: "key",
              title: "Key idea that unifies this whole unit",
              blocks: [
                {
                  type: "text",
                  value:
                    "Every model in this unit answers the same question differently: **“How do I learn a good model of $p(x)$ using only unlabelled data?”**",
                },
                {
                  type: "table",
                  headers: ["Model family", "Its one-line answer"],
                  rows: [
                    ["Autoencoder / VAE", "Learn by compressing and reconstructing $x$ through a bottleneck."],
                    ["GAN", "Learn by playing a two-player minimax game between a generator and a discriminator."],
                    [
                      "Maximum Entropy",
                      "Choose the least-biased distribution consistent with known constraints — the theoretical justification behind many of these models.",
                    ],
                    [
                      "RBM / DBN / DBM / ConvBM",
                      "Define an energy function over (visible, hidden) units and learn its parameters so that observed data has low energy (high probability).",
                    ],
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
      id: "u4-l2",
      title: "Autoencoders",
      subtitle: "Copy your input through a bottleneck — and discover that compression forces representation.",
      minutes: 17,
      sections: [
        {
          id: "u4-l2-s1",
          title: "Concept and motivation",
          blocks: [
            {
              type: "bullets",
              items: [
                "An autoencoder is a neural network trained to **copy its input to its output, through a narrow bottleneck**.",
                "Because it is forced through a bottleneck, it cannot just memorise — it must learn a **compressed, useful representation** of the data.",
                "It is trained with **no labels** — the “label” for input $x$ is $x$ itself. This is called **self-supervised learning**.",
              ],
            },
            { type: "text", value: "It has two parts, trained jointly, end-to-end, by gradient descent:" },
            {
              type: "bullets",
              items: [
                "**Encoder $f$:** maps input $x$ to a latent code $z$ (compression).",
                "**Decoder $g$:** maps the code $z$ back to a reconstruction $\\hat{x}$ (decompression).",
              ],
            },
            {
              type: "text",
              value:
                "**Architecture (Fig. 2.1):** an input layer of $n$ units feeds a much narrower bottleneck layer, and the single code vector $z$ feeds an output layer of $n$ units again. The network is an hourglass — wide → narrow → wide — and training squeezes every example through the narrow waist, scoring how faithfully it re-emerges.",
            },
          ],
        },
        {
          id: "u4-l2-s2",
          title: "Mathematical formulation",
          blocks: [
            { type: "text", value: "For input $x \\in \\mathbb{R}^n$:" },
            { type: "formula", tex: "z = f(x) = \\sigma(Wx + b)", caption: "Encoder — compress the input into the code" },
            { type: "formula", tex: "\\hat{x} = g(z) = \\sigma(W'z + b')", caption: "Decoder — reconstruct the input from the code" },
            {
              type: "text",
              value:
                "where $\\sigma$ is a non-linear activation (sigmoid / ReLU / tanh), and $W, b, W', b'$ are learned weights and biases. Training minimises the reconstruction loss between $x$ and $\\hat{x}$, most commonly **Mean Squared Error**:",
            },
            {
              type: "formula",
              tex: "L(x, \\hat{x}) = \\frac{1}{n}\\sum_{i=1}^{n}\\left(x_i - \\hat{x}_i\\right)^2",
              caption: "Reconstruction loss (MSE)",
            },
            {
              type: "callout",
              variant: "key",
              title: "Significance of the loss",
              blocks: [
                {
                  type: "text",
                  value:
                    "Minimising this loss is exactly what forces the bottleneck to keep only the most important information needed to reconstruct $x$ — unimportant / noisy variation is discarded.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l2-s3",
          title: "Worked Example 2.1 — forward pass through a small autoencoder",
          blocks: [
            {
              type: "example",
              title: "Worked Example 2.1 — Forward Pass Through a Small Autoencoder",
              given: [
                "Input $x = [0.8, 0.3]$ ($n = 2$), a **1-unit bottleneck**, sigmoid activation",
                "Encoder weights $W = [0.5, -0.3]$, bias $b = 0.1$",
                "Decoder weights $W' = [0.6, 0.4]^\\top$, bias $b' = [0, 0]$",
                "Find the reconstruction and the loss.",
              ],
              steps: [
                {
                  label: "Step 1 — Encoder pre-activation (weighted sum of inputs)",
                  blocks: [
                    { type: "formula", tex: "z_{pre} = (0.5)(0.8) + (-0.3)(0.3) + 0.1 = 0.40 - 0.09 + 0.10 = 0.41" },
                    {
                      type: "text",
                      value:
                        "This is the encoder deciding how much each input contributes to the compressed code.",
                    },
                  ],
                },
                {
                  label: "Step 2 — Apply activation",
                  blocks: [
                    { type: "formula", tex: "z = \\sigma(0.41) = \\frac{1}{1 + e^{-0.41}} = 0.6011" },
                    {
                      type: "text",
                      value:
                        "The sigmoid squashes the code into $(0,1)$ and adds the non-linearity that lets the network represent more than a linear projection (unlike PCA).",
                    },
                  ],
                },
                {
                  label: "Step 3 — Decoder pre-activations",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\hat{x}_{1,pre} = (0.6)(0.6011) = 0.3606, \\qquad \\hat{x}_{2,pre} = (0.4)(0.6011) = 0.2404",
                    },
                    {
                      type: "text",
                      value:
                        "The single code value $z$ is expanded back out to 2 numbers, one per output unit.",
                    },
                  ],
                },
                {
                  label: "Step 4 — Apply activation to get the reconstruction",
                  blocks: [{ type: "formula", tex: "\\hat{x} = [\\sigma(0.3606), \\sigma(0.2404)] = [0.5892, 0.5598]" }],
                },
                {
                  label: "Step 5 — Reconstruction loss (MSE)",
                  blocks: [
                    {
                      type: "formula",
                      tex: "L = \\frac{1}{2}\\left[(0.8 - 0.5892)^2 + (0.3 - 0.5598)^2\\right] = \\frac{1}{2}[0.0444 + 0.0675] = 0.0560",
                    },
                    {
                      type: "text",
                      value:
                        "This single number is the training signal — backpropagation adjusts $W, b, W', b'$ to reduce it.",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "The code $z = 0.6011$ is a single number that had to summarise both 0.8 and 0.3. The loss (0.056) tells us how much information was lost in that compression — with only 1 bottleneck unit for 2 inputs, some loss is expected.",
                },
              ],
            },
            {
              type: "widget",
              widgetId: "u4-ae-lab",
              title: "Autoencoder lab",
              description:
                "Shrink the bottleneck and watch a 2-D input compress into a 1-D code, then reconstruct — reproduce Worked Example 2.1 number for number and watch the loss respond.",
            },
          ],
        },
        {
          id: "u4-l2-s4",
          title: "Types of autoencoders",
          blocks: [
            {
              type: "table",
              headers: ["Type", "Key Idea", "Mechanism", "Typical Use"],
              rows: [
                [
                  "Undercomplete",
                  "Bottleneck dim < input dim",
                  "Forces compression; simplest, most common form",
                  "Dimensionality reduction, feature learning",
                ],
                [
                  "Overcomplete",
                  "Bottleneck dim ≥ input dim",
                  "Needs an extra constraint (below) or it just learns identity",
                  "Used only combined with sparsity / noise / contractive penalty",
                ],
                [
                  "Sparse",
                  "Penalise number of “active” hidden units",
                  "Adds sparsity penalty (e.g. KL-divergence) on hidden activations",
                  "Learn interpretable, disentangled features",
                ],
                [
                  "Denoising (DAE)",
                  "Reconstruct clean $x$ from corrupted $\\tilde{x}$",
                  "Input is corrupted (noise / masking) before encoding; target is original $x$",
                  "Robust features, noise removal",
                ],
                [
                  "Contractive (CAE)",
                  "Penalise sensitivity to input",
                  "Adds $\\|\\partial h / \\partial x\\|^2$ penalty (Jacobian norm) to loss",
                  "Robust, locally-invariant representations",
                ],
              ],
              caption: "The five autoencoder flavours — a favourite exam table.",
            },
            {
              type: "callout",
              variant: "warning",
              title: "The overcomplete trap",
              blocks: [
                {
                  type: "text",
                  value:
                    "If the bottleneck is as wide as (or wider than) the input and no extra constraint is added, the network can trivially learn the identity mapping — and learns nothing useful. Overcomplete autoencoders are only meaningful together with a sparsity, denoising or contractive penalty.",
                },
              ],
            },
            { type: "heading", value: "Sparse autoencoder — the sparsity penalty" },
            {
              type: "text",
              value:
                "Let $\\rho$ be the desired (small) target sparsity, e.g. 0.05, and $\\hat{\\rho}_j$ the average activation of hidden unit $j$ over the training batch. The sparsity penalty for unit $j$ is the KL-divergence between two Bernoulli distributions:",
            },
            {
              type: "formula",
              tex: "KL(\\rho \\,\\|\\, \\hat{\\rho}_j) = \\rho \\log\\frac{\\rho}{\\hat{\\rho}_j} + (1-\\rho)\\log\\frac{1-\\rho}{1-\\hat{\\rho}_j}",
              caption: "Sparsity penalty — exactly 0 only when ρ̂ⱼ matches the target ρ",
            },
            {
              type: "example",
              title: "Worked Example 2.2 — Sparsity Penalty Computation",
              given: [
                "Target sparsity $\\rho = 0.05$",
                "Observed average activation $\\hat{\\rho} = 0.20$",
                "Find the KL penalty (natural log).",
              ],
              steps: [
                {
                  label: "Step 1 — First term (penalises unit being “on” too often relative to target)",
                  blocks: [
                    {
                      type: "formula",
                      tex: "0.05 \\times \\ln(0.05/0.20) = 0.05 \\times \\ln(0.25) = 0.05 \\times (-1.3863) = -0.0693",
                    },
                  ],
                },
                {
                  label: "Step 2 — Second term (penalises the “off” probability mismatch)",
                  blocks: [
                    {
                      type: "formula",
                      tex: "0.95 \\times \\ln(0.95/0.80) = 0.95 \\times \\ln(1.1875) = 0.95 \\times 0.1718 = 0.1632",
                    },
                  ],
                },
                {
                  label: "Step 3 — Sum",
                  blocks: [
                    { type: "formula", tex: "KL(0.05 \\,\\|\\, 0.20) = -0.0693 + 0.1632 = 0.0939 \\text{ nats}" },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "Since $\\hat{\\rho}$ (0.20) is far above the target $\\rho$ (0.05), the penalty is clearly positive; it would be exactly 0 if $\\hat{\\rho} = \\rho$, and gradient descent pushes $\\hat{\\rho}$ back toward $\\rho$, i.e. towards a sparser (mostly-off) hidden layer.",
                },
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u4-check-1",
                  question: "What is the primary purpose of the bottleneck (latent) layer in an autoencoder?",
                  options: [
                    "To increase the model's raw capacity",
                    "To force the network to learn a compressed, useful representation of the input",
                    "To add regularisation noise to the gradients",
                    "To speed up training regardless of representation quality",
                  ],
                  correct: 1,
                  explanation:
                    "The bottleneck is narrower than the input, so the network cannot simply copy — it must retain only the most important information needed to reconstruct x, which is exactly what makes the learned code z useful.",
                },
                {
                  id: "u4-check-2",
                  question: "In an undercomplete autoencoder, the dimensionality of the hidden (latent) layer is:",
                  options: [
                    "Greater than the input dimension",
                    "Equal to the input dimension",
                    "Less than the input dimension",
                    "Always exactly 1, regardless of input size",
                  ],
                  correct: 2,
                  explanation:
                    "“Undercomplete” means the code is lower-dimensional than the input — this is exactly what forces compression.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l2-s5",
          title: "Applications",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Dimensionality reduction** — a non-linear generalisation of PCA.",
                "**Image denoising and inpainting.**",
                "**Anomaly / fraud detection** — anomalies have high reconstruction error.",
                "**Pre-training** deep networks layer-by-layer before supervised fine-tuning.",
                "The learned code $z$ as a **compact feature vector** for retrieval, clustering, or as input to another model (e.g. the encoder of a VAE, Lesson 3).",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u4-l3",
      title: "Variational Autoencoders (VAE)",
      subtitle: "Make the latent space a Gaussian — the reparameterization trick and the ELBO, derived step by step.",
      minutes: 18,
      sections: [
        {
          id: "u4-l3-s1",
          title: "Motivation: why not just use a plain autoencoder?",
          blocks: [
            {
              type: "bullets",
              items: [
                "A plain autoencoder's latent space has **no structure** — codes for real inputs may be scattered in isolated clusters with large empty gaps between them.",
                "If we pick a random point $z$ in that space and decode it, the result is usually **garbage** — so plain autoencoders are poor generative models.",
                "A VAE fixes this by treating the code as **random, not deterministic**: it forces the distribution of $z$ (for all the data) to look like a simple, known prior, typically $N(0, I)$.",
                "Because the whole latent space is now “filled in” and shaped like a Gaussian, **any $z$ sampled from $N(0, I)$ decodes into something realistic** — the VAE can generate new data.",
              ],
            },
            {
              type: "compare",
              pairs: [
                {
                  label: "Plain autoencoder",
                  left: [
                    "Deterministic code — one point $z = f(x)$ per input",
                    "Latent space full of gaps — decoding a gap point gives garbage",
                    "Optimises reconstruction only",
                    "Compresses and denoises well; generates poorly",
                  ],
                  right: [],
                },
                {
                  label: "Variational autoencoder",
                  left: [
                    "Random code — a distribution $q_\\phi(z|x)$ per input",
                    "KL term shapes the whole space toward $N(0, I)$ — no gaps",
                    "Optimises the ELBO — reconstruction + KL regulariser",
                    "Compresses **and** generates new samples",
                  ],
                  right: [],
                },
              ],
            },
          ],
        },
        {
          id: "u4-l3-s2",
          title: "Probabilistic formulation",
          blocks: [
            {
              type: "bullets",
              items: [
                "Assume the data is generated as: sample a latent $z \\sim p(z) = N(0, I)$, then sample $x \\sim p_\\theta(x|z)$ — the **decoder**.",
                "We want the true posterior $p(z|x)$, but it is **intractable**, so we approximate it with an encoder network $q_\\phi(z|x)$ — this is why the method is called **“variational”** (variational = approximate inference).",
                "$q_\\phi(z|x)$ is chosen to be Gaussian: $q_\\phi(z|x) = N\\left(\\mu(x), \\sigma^2(x)\\right)$, with $\\mu(x)$ and $\\sigma(x)$ output by the encoder network.",
              ],
            },
            {
              type: "text",
              value:
                "**Architecture (Fig. 3.1):** the encoder no longer outputs a point but a **distribution** — a mean $\\mu$ and standard deviation $\\sigma$ for every latent dimension. A sample $z$ is drawn from that distribution via the **reparameterization trick**, and the decoder reconstructs $x$ from it.",
            },
          ],
        },
        {
          id: "u4-l3-s3",
          title: "The reparameterization trick",
          blocks: [
            {
              type: "text",
              value:
                "**Problem:** we need to backpropagate through the sampling step $z \\sim N(\\mu, \\sigma^2)$, but sampling is a random, **non-differentiable** operation.",
            },
            {
              type: "text",
              value:
                "**Trick:** rewrite the random sample as a deterministic function of $\\mu$, $\\sigma$ and an independent noise source $\\varepsilon$:",
            },
            {
              type: "formula",
              tex: "z = \\mu + \\sigma \\odot \\varepsilon, \\qquad \\varepsilon \\sim N(0, I)",
              caption: "The reparameterization trick — randomness moved outside the network",
            },
            {
              type: "callout",
              variant: "key",
              title: "Why this works",
              blocks: [
                {
                  type: "text",
                  value:
                    "Now the randomness ($\\varepsilon$) is external to the network, and $z$ is a **differentiable function of $\\mu$ and $\\sigma$** — gradients can flow from the reconstruction loss, through $z$, back into the encoder's $\\mu$ and $\\sigma$ outputs, and hence into all encoder weights.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l3-s4",
          title: "Deriving the Evidence Lower Bound (ELBO)",
          blocks: [
            {
              type: "text",
              value:
                "We cannot maximise $\\log p(x)$ directly (it needs the intractable integral over $z$), so we derive a tractable lower bound on it, step by step:",
            },
            {
              type: "example",
              title: "The 4-step ELBO derivation",
              steps: [
                {
                  label: "Step 1 — Introduce the latent variable by marginalisation",
                  blocks: [{ type: "formula", tex: "\\log p(x) = \\log \\int p(x, z)\\, dz" }],
                },
                {
                  label: "Step 2 — Multiply and divide by q_φ(z|x) (valid since q_φ(z|x) > 0)",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\log p(x) = \\log \\mathbb{E}_{q}\\!\\left[\\frac{p(x, z)}{q_\\phi(z|x)}\\right]",
                    },
                    { type: "text", value: "This turns the integral into an expectation under $q$." },
                  ],
                },
                {
                  label: "Step 3 — Apply Jensen's Inequality (log is concave, so log E[X] ≥ E[log X])",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\log p(x) \\ge \\mathbb{E}_{q}\\!\\left[\\log p(x, z) - \\log q_\\phi(z|x)\\right] \\equiv \\text{ELBO}",
                    },
                    {
                      type: "text",
                      value:
                        "**Significance:** this step is what makes the objective tractable — we now have a lower bound we **CAN** compute and maximise, instead of the exact $\\log p(x)$ which we cannot.",
                    },
                  ],
                },
                {
                  label: "Step 4 — Factor p(x,z) = p(x|z)·p(z) and split the expectation into two interpretable terms",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\text{ELBO} = \\mathbb{E}_{q}\\!\\left[\\log p_\\theta(x|z)\\right] - KL\\!\\left(q_\\phi(z|x) \\,\\|\\, p(z)\\right)",
                    },
                    {
                      type: "bullets",
                      items: [
                        "**Reconstruction term** $E_q[\\log p_\\theta(x|z)]$: how well the decoder reconstructs $x$ from a sampled $z$ — pulls $z$ toward encoding useful information.",
                        "**Regularisation term** $KL(q_\\phi(z|x) \\| p(z))$: keeps the encoder's distribution close to the prior $N(0,I)$ — keeps the latent space smooth and generative.",
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "text",
              value:
                "**Final VAE training objective (minimised).** Since we minimise a loss rather than maximise the ELBO, we flip the sign:",
            },
            {
              type: "formula",
              tex: "L_{VAE} = -\\mathbb{E}_{q}\\!\\left[\\log p_\\theta(x|z)\\right] + KL\\!\\left(q_\\phi(z|x) \\,\\|\\, p(z)\\right)",
              caption: "≡ Reconstruction Loss + KL Divergence Loss",
            },
            {
              type: "text",
              value:
                "For a Gaussian encoder $q_\\phi(z|x) = N(\\mu, \\sigma^2)$ and prior $N(0,1)$, the KL term has a convenient closed form (per latent dimension):",
            },
            {
              type: "formula",
              tex: "KL\\!\\left(N(\\mu, \\sigma^2) \\,\\|\\, N(0,1)\\right) = \\frac{1}{2}\\left(\\mu^2 + \\sigma^2 - \\ln \\sigma^2 - 1\\right)",
              caption: "Closed-form KL for a Gaussian encoder against the standard normal prior",
            },
            {
              type: "callout",
              variant: "tip",
              title: "What maximising the ELBO really does",
              blocks: [
                {
                  type: "text",
                  value:
                    "The gap between the ELBO and $\\log p(x)$ is exactly $KL(q_\\phi(z|x) \\,\\|\\, p(z|x))$ — so maximising the ELBO also implicitly makes $q_\\phi$ a better approximation of the true posterior.",
                },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "The weighted form — β-VAE",
              blocks: [
                {
                  type: "text",
                  value:
                    "In practice the total loss is written $L = \\text{Reconstruction} + \\beta \\cdot KL$. With $\\beta = 1$ this is the standard VAE; a $\\beta > 1$ (as in the **β-VAE**) weights the KL term more, trading reconstruction sharpness for a more disentangled, more regularised latent space.",
                },
              ],
            },
            {
              type: "example",
              title: "Worked Example 3.1 — Reparameterization and KL Divergence",
              given: [
                "The encoder, for a given $x$, outputs $\\mu = 0.3$, $\\sigma = 0.5$.",
                "A noise sample $\\varepsilon = 1.0$ is drawn from $N(0,1)$.",
                "Find (a) the sampled latent $z$, and (b) the KL-divergence loss term.",
              ],
              steps: [
                {
                  label: "Step 1 — Reparameterization trick (this IS the sampling step, made differentiable)",
                  blocks: [{ type: "formula", tex: "z = \\mu + \\sigma \\cdot \\varepsilon = 0.3 + (0.5)(1.0) = 0.8" }],
                },
                {
                  label: "Step 2 — Compute σ² and ln(σ²) needed for the KL formula",
                  blocks: [{ type: "formula", tex: "\\sigma^2 = 0.25, \\qquad \\ln(0.25) = -1.3863" }],
                },
                {
                  label: "Step 3 — Substitute into the closed-form KL expression",
                  blocks: [
                    {
                      type: "formula",
                      tex: "KL = \\frac{1}{2}\\left(0.09 + 0.25 - (-1.3863) - 1\\right) = \\frac{1}{2}(0.7263) = 0.3632",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "$z = 0.8$ is the actual latent value passed to the decoder this iteration. $KL = 0.363$ nats is the “cost” charged for this encoder distribution $N(0.3, 0.25)$ being different from the prior $N(0,1)$ — training pushes $\\mu$ toward 0 and $\\sigma$ toward 1 unless the reconstruction term needs otherwise.",
                },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Exam pointers",
              blocks: [
                {
                  type: "text",
                  value:
                    "The 4-step ELBO derivation plus a reparameterization / KL numerical (exactly like Example 3.1) is the classic VAE exam question. Memorise $z = \\mu + \\sigma \\odot \\varepsilon$ and $KL = \\frac{1}{2}(\\mu^2 + \\sigma^2 - \\ln\\sigma^2 - 1)$ — and note that $\\sigma$ enters **squared**: with $\\sigma = 0.5$ use $\\sigma^2 = 0.25$.",
                },
              ],
            },
            {
              type: "widget",
              widgetId: "u4-vae-lab",
              title: "VAE lab",
              description:
                "Move the encoder's μ and σ, draw the noise ε, and watch the reparameterization trick assemble z — then see how the KL term pulls the latent distribution toward N(0, I).",
            },
          ],
        },
        {
          id: "u4-l3-s5",
          title: "Applications",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Generating new, realistic samples** (faces, digits, molecules) by decoding $z \\sim N(0, I)$.",
                "**Smooth latent-space interpolation** between two data points.",
                "**Semi-supervised learning and anomaly detection** using the likelihood / ELBO as a score.",
                "**Representation learning** where a smooth, disentangled latent space matters (unlike a plain AE).",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u4-l4",
      title: "Generative Adversarial Networks (GAN)",
      subtitle: "A forger and a detective: the minimax game, the optimal discriminator, and why training is hard.",
      minutes: 18,
      sections: [
        {
          id: "u4-l4-s1",
          title: "Concept: a two-player game",
          blocks: [
            {
              type: "bullets",
              items: [
                "A GAN trains **two networks that compete** against each other:",
                "**Generator $G$:** takes random noise $z \\sim p(z)$ and tries to produce fake samples $G(z)$ that look real.",
                "**Discriminator $D$:** takes a sample (real or fake) and outputs the probability that it is real.",
                "$G$ is trained to **fool** $D$; $D$ is trained to **catch** $G$. Neither ever sees labelled data — the “supervision” comes entirely from this competition, so training is **unsupervised at the data level**.",
                "Unlike the VAE, a GAN has **no explicit reconstruction loss and no explicit density $p(x)$** — it learns to sample from $p(x)$ **implicitly**.",
              ],
            },
            {
              type: "text",
              value:
                "**Architecture (Fig. 4.1):** the generator produces fakes from noise; the discriminator scores real vs. fake; gradients flow back to train both networks.",
            },
          ],
        },
        {
          id: "u4-l4-s2",
          title: "The minimax objective",
          blocks: [
            {
              type: "formula",
              tex: "\\min_G \\max_D V(D,G) = \\mathbb{E}_{x \\sim p_{data}}\\left[\\log D(x)\\right] + \\mathbb{E}_{z \\sim p_z}\\left[\\log\\left(1 - D(G(z))\\right)\\right]",
              caption: "The GAN value function — a two-player zero-sum game",
            },
            {
              type: "bullets",
              items: [
                "**$D$ wants to maximise $V$:** push $D(x) \\to 1$ for real $x$, and $D(G(z)) \\to 0$ for fakes.",
                "**$G$ wants to minimise $V$:** push $D(G(z)) \\to 1$, i.e. make the discriminator think fakes are real.",
                "**Training alternates:** a few steps of gradient ascent on $D$ (with $G$ fixed), then a step of gradient descent on $G$ (with $D$ fixed).",
              ],
            },
            {
              type: "widget",
              widgetId: "u4-gan-lab",
              title: "GAN training arena",
              description:
                "Step through the minimax game — the discriminator learns to separate real from fake while the generator fights back. Watch the losses, D(G(z)) and the road to the D* = 1/2 equilibrium.",
            },
          ],
        },
        {
          id: "u4-l4-s3",
          title: "The optimal discriminator — derivation and worked example",
          blocks: [
            {
              type: "text",
              value:
                "For a fixed generator $G$ (hence a fixed generator distribution $p_g$), find the $D$ that maximises $V$:",
            },
            {
              type: "example",
              title: "Deriving the Optimal Discriminator D*(x)",
              steps: [
                {
                  label: "Step 1 — Rewrite the second expectation as an integral over x using x = G(z)",
                  blocks: [
                    {
                      type: "formula",
                      tex: "V(D,G) = \\int_x \\left[ p_{data}(x) \\log D(x) + p_g(x) \\log(1 - D(x)) \\right] dx",
                    },
                  ],
                },
                {
                  label:
                    "Step 2 — For each fixed x this is a scalar function of y = D(x) alone: f(y) = a·log y + b·log(1−y), with a = p_data(x), b = p_g(x). Maximise using df/dy = 0",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\frac{a}{y} - \\frac{b}{1-y} = 0 \\;\\Rightarrow\\; a(1-y) = by \\;\\Rightarrow\\; y = \\frac{a}{a+b}",
                    },
                  ],
                },
                {
                  label: "Step 3 — Substitute back a, b",
                  blocks: [
                    {
                      type: "formula",
                      tex: "D^*(x) = \\frac{p_{data}(x)}{p_{data}(x) + p_g(x)}",
                      caption: "The optimal discriminator for a fixed generator",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "Significance — the Nash equilibrium",
              blocks: [
                {
                  type: "text",
                  value:
                    "At the Nash equilibrium the generator matches the data exactly, $p_g = p_{data}$, so $D^*(x) = 1/2$ everywhere — the best possible discriminator can do no better than a **coin flip**. This is the theoretical training target for a GAN.",
                },
              ],
            },
            {
              type: "example",
              title: "Worked Example 4.1 — Discriminator and Generator Loss",
              given: [
                "For one real sample, $D(x) = 0.7$.",
                "For one fake sample, $D(G(z)) = 0.4$.",
                "Compute the discriminator loss and the (non-saturating) generator loss.",
              ],
              steps: [
                {
                  label: "Step 1 — Discriminator loss (negative of what D maximises — D wants this LOW)",
                  blocks: [
                    {
                      type: "formula",
                      tex: "L_D = -\\left[\\log D(x) + \\log(1 - D(G(z)))\\right] = -\\left[\\ln(0.7) + \\ln(0.6)\\right]",
                    },
                    { type: "formula", tex: "= -\\left[(-0.3567) + (-0.5108)\\right] = 0.8675" },
                  ],
                },
                {
                  label: "Step 2 — Generator loss, non-saturating form (used in practice — G wants this LOW)",
                  blocks: [{ type: "formula", tex: "L_G = -\\log D(G(z)) = -\\ln(0.4) = 0.9163" }],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "$D(G(z)) = 0.4$ means $D$ is already leaning toward “fake” but is not fully certain — both losses are moderate, meaning both networks still have learning signal to improve.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l4-s4",
          title: "Training challenges",
          blocks: [
            { type: "heading", value: "(a) Vanishing gradients — why the non-saturating loss is used" },
            {
              type: "bullets",
              items: [
                "The original minimax loss for $G$ is $\\log(1 - D(G(z)))$, minimised by $G$.",
                "Early in training, $G$ is poor, so $D$ confidently rejects fakes: $D(G(z))$ is small (say 0.2). Compare the gradient magnitude of the two loss formulations with respect to $s = D(G(z))$ at $s = 0.2$:",
              ],
            },
            {
              type: "formula",
              tex: "\\text{Original:} \\quad \\frac{d}{ds}\\left[\\log(1-s)\\right] = -\\frac{1}{1-s} = -\\frac{1}{0.8} = -1.25",
              caption: "Gradient of the original generator loss at s = 0.2",
            },
            {
              type: "formula",
              tex: "\\text{Non-saturating:} \\quad \\frac{d}{ds}\\left[-\\log s\\right] = -\\frac{1}{s} = -\\frac{1}{0.2} = -5.00",
              caption: "Gradient of the non-saturating generator loss at s = 0.2",
            },
            {
              type: "bullets",
              items: [
                "The non-saturating gradient (5.00) is **4× larger in magnitude exactly when G is performing badly** — it gives a much stronger learning signal precisely when $G$ needs it most.",
                "This is why in practice $G$ is trained to **maximise $\\log D(G(z))$** (equivalently, minimise $-\\log D(G(z))$) instead of minimising $\\log(1 - D(G(z)))$.",
              ],
            },
            { type: "heading", value: "(b) Mode collapse" },
            {
              type: "callout",
              variant: "warning",
              title: "Mode collapse — symptom and remedies",
              blocks: [
                {
                  type: "text",
                  value:
                    "$G$ discovers a few outputs that reliably fool $D$, and collapses to producing only those — **losing the diversity of $p_{data}$. Symptom:** generated samples look realistic individually but are highly repetitive. **Remedies:** mini-batch discrimination, unrolled GANs, Wasserstein GAN (WGAN) with gradient penalty, feature matching.",
                },
              ],
            },
            { type: "heading", value: "(c) Training instability" },
            {
              type: "bullets",
              items: [
                "Because it is a minimax game (not a single loss being minimised), training can **oscillate** rather than converge.",
                "**Remedies:** careful learning-rate balance between $G$ and $D$, spectral normalisation, WGAN loss (uses the Wasserstein / Earth-Mover distance, which gives smoother gradients than the original JS-divergence-based loss).",
              ],
            },
          ],
        },
        {
          id: "u4-l4-s5",
          title: "Notable GAN variants",
          blocks: [
            {
              type: "table",
              headers: ["Variant", "Key idea"],
              rows: [
                ["DCGAN", "Uses convolutional layers for stable image generation."],
                ["Conditional GAN (cGAN)", "Both $G$ and $D$ are additionally conditioned on a class label $y$."],
                ["CycleGAN", "Unpaired image-to-image translation using a cycle-consistency loss."],
                ["WGAN", "Replaces the JS-divergence objective with the Wasserstein distance for more stable gradients."],
              ],
            },
          ],
        },
        {
          id: "u4-l4-s6",
          title: "Applications",
          blocks: [
            {
              type: "bullets",
              items: [
                "Photorealistic image synthesis, super-resolution, image-to-image translation.",
                "Data augmentation for downstream supervised tasks.",
                "Deepfake / style-transfer / art-generation systems.",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u4-l5",
      title: "Maximum Entropy Distributions",
      subtitle: "Jaynes' principle — the uniform and the Gaussian are not accidents, they are the least-biased choices.",
      minutes: 15,
      sections: [
        {
          id: "u4-l5-s1",
          title: "Entropy — a recap",
          blocks: [
            {
              type: "text",
              value:
                "Entropy measures the **uncertainty / unpredictability** of a random variable $X$ with distribution $p$. Discrete case:",
            },
            {
              type: "formula",
              tex: "H(p) = -\\sum_{x} p(x) \\log p(x)",
              caption: "Entropy of a discrete distribution",
            },
            {
              type: "bullets",
              items: [
                "**High entropy** = very unpredictable (close to uniform); **low entropy** = predictable (probability mass concentrated on few outcomes).",
                "The base of the log sets the unit: **base-2 → bits, base-e → nats**.",
              ],
            },
            {
              type: "widget",
              widgetId: "u4-entropy-lab",
              title: "Entropy explorer",
              description:
                "Drag the probabilities of a distribution and watch H(p) respond in bits and nats — can any distribution over n outcomes beat the uniform?",
            },
          ],
        },
        {
          id: "u4-l5-s2",
          title: "The Maximum Entropy Principle",
          blocks: [
            {
              type: "bullets",
              items: [
                "Stated by **E.T. Jaynes (1957)**: given only partial information about a distribution (some constraints, e.g. its mean), choose the distribution that has **maximum entropy while satisfying those constraints**.",
                "**Why?** The max-entropy distribution is the “most honest” / least biased choice — it assumes **nothing beyond what is actually known**. Any other distribution satisfying the same constraints implicitly encodes extra, unjustified assumptions.",
                "This turns distribution selection into a **constrained optimisation problem**, solved using **Lagrange multipliers**.",
              ],
            },
          ],
        },
        {
          id: "u4-l5-s3",
          title: "Derivation 1 — no constraints ⇒ uniform distribution",
          blocks: [
            {
              type: "text",
              value:
                "For a discrete variable with $n$ outcomes, maximise $H(p)$ subject only to normalisation $\\sum_i p_i = 1$.",
            },
            {
              type: "example",
              title: "Derivation 1 — No Constraints ⇒ Uniform Distribution",
              steps: [
                {
                  label: "Step 1 — Form the Lagrangian",
                  blocks: [
                    { type: "formula", tex: "\\mathcal{L} = -\\sum_i p_i \\ln p_i + \\lambda\\left(\\sum_i p_i - 1\\right)" },
                  ],
                },
                {
                  label: "Step 2 — Differentiate w.r.t. each p_i and set to 0",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\frac{\\partial \\mathcal{L}}{\\partial p_i} = -\\ln p_i - 1 + \\lambda = 0 \\;\\Rightarrow\\; \\ln p_i = \\lambda - 1",
                    },
                  ],
                },
                {
                  label: "Step 3 — Since the right side has no i in it, every p_i must be the SAME constant c",
                  blocks: [
                    { type: "formula", tex: "p_i = e^{\\lambda-1} = c \\qquad (\\text{same for all } i)" },
                  ],
                },
                {
                  label: "Step 4 — Apply normalisation to solve for c",
                  blocks: [
                    {
                      type: "formula",
                      tex: "n \\cdot c = 1 \\;\\Rightarrow\\; c = \\frac{1}{n} \\;\\Rightarrow\\; p_i = \\frac{1}{n} \\text{ for every } i",
                      caption: "— the UNIFORM distribution",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "Significance",
              blocks: [
                {
                  type: "text",
                  value:
                    "With no information at all except that probabilities sum to 1, spreading probability equally is the least-biased choice — this confirms intuition.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l5-s4",
          title: "Derivation 2 — mean & variance known ⇒ Gaussian distribution",
          blocks: [
            {
              type: "text",
              value:
                "For a continuous variable, maximise $H[p] = -\\int p(x) \\ln p(x)\\, dx$ subject to **three constraints**: normalisation, a fixed mean $\\mu$, and a fixed variance $\\sigma^2$.",
            },
            {
              type: "example",
              title: "Derivation 2 — Mean & Variance Known ⇒ Gaussian Distribution",
              steps: [
                {
                  label: "Step 1 — Lagrangian with one multiplier per constraint",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\mathcal{L} = -\\int p \\ln p\\, dx + \\lambda_0\\left(\\int p\\, dx - 1\\right) + \\lambda_1\\left(\\int x p\\, dx - \\mu\\right) + \\lambda_2\\left(\\int (x-\\mu)^2 p\\, dx - \\sigma^2\\right)",
                    },
                  ],
                },
                {
                  label: "Step 2 — Take the functional derivative w.r.t. p(x) and set to 0",
                  blocks: [
                    {
                      type: "formula",
                      tex: "-\\ln p(x) - 1 + \\lambda_0 + \\lambda_1 x + \\lambda_2(x-\\mu)^2 = 0",
                    },
                  ],
                },
                {
                  label: "Step 3 — Solve for p(x) — note this is already an exponential-family form",
                  blocks: [
                    {
                      type: "formula",
                      tex: "p(x) = \\exp\\left(\\lambda_0 - 1 + \\lambda_1 x + \\lambda_2(x-\\mu)^2\\right)",
                    },
                  ],
                },
                {
                  label:
                    "Step 4 — Fixing λ₁ = 0 (required by the mean constraint being centred at μ) and identifying λ₂ = −1/(2σ²) from the variance constraint, then fixing the remaining constant from normalisation, gives",
                  blocks: [
                    {
                      type: "formula",
                      tex: "p(x) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)",
                      caption: "— the Normal / Gaussian distribution N(μ, σ²)",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "Significance — why Gaussians appear everywhere",
              blocks: [
                {
                  type: "text",
                  value:
                    "This is exactly why the Gaussian appears everywhere — it is **provably the least-assumption distribution** whenever we only know (or only want to assume) the mean and variance of a variable. It is the formal justification behind using Gaussian priors / noise models throughout deep learning — including the VAE prior $p(z) = N(0, I)$ of Lesson 3.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l5-s5",
          title: "Worked Example 5.1 — entropy of a discrete distribution",
          blocks: [
            {
              type: "example",
              title: "Worked Example 5.1 — Entropy of a Discrete Distribution",
              given: [
                "Compare the entropy of $p = [0.5, 0.3, 0.2]$ with the entropy of the uniform distribution over the same 3 outcomes.",
                "Use log base 2, i.e. bits.",
              ],
              steps: [
                {
                  label: "Step 1 — Compute each −p_i log₂ p_i term",
                  blocks: [
                    {
                      type: "formula",
                      tex: "-(0.5)\\log_2(0.5) = 0.5000, \\quad -(0.3)\\log_2(0.3) = 0.5211, \\quad -(0.2)\\log_2(0.2) = 0.4644",
                    },
                  ],
                },
                {
                  label: "Step 2 — Sum for H(p)",
                  blocks: [
                    { type: "formula", tex: "H(p) = 0.5000 + 0.5211 + 0.4644 = 1.4855 \\text{ bits}" },
                  ],
                },
                {
                  label: "Step 3 — Entropy of the uniform distribution over 3 outcomes, for comparison",
                  blocks: [
                    { type: "formula", tex: "H(\\text{uniform}) = \\log_2(3) = 1.5850 \\text{ bits}" },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "$H(p) = 1.4855 < H(\\text{uniform}) = 1.5850$. This numerically confirms Derivation 1: among all distributions over 3 outcomes, the uniform distribution has the strictly highest entropy — any deviation from uniform (like favouring 0.5 for one outcome) reduces entropy.",
                },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Two classic results to memorise",
              blocks: [
                {
                  type: "text",
                  value:
                    "No constraints → uniform. Mean + variance known → Gaussian. Both are standard long-answer derivation questions, and both numerical checks (entropy sums like Example 5.1) appear regularly.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l5-s6",
          title: "Relevance to deep learning",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Softmax:** the softmax output of a classifier is precisely the maximum-entropy distribution over class labels, subject to matching the expected value of the network's logits — softmax is not an arbitrary choice, it is the **least-biased** one given those constraints.",
                "**Boltzmann / Gibbs distribution:** the form $p(v,h) \\propto \\exp(-E(v,h))$ used by every model in the rest of this unit (RBM, DBN, DBM, ConvBM) is exactly the maximum-entropy distribution subject to a constraint on the expected energy $\\langle E \\rangle$ — this is the **theoretical bridge** from this lesson into Lessons 6–8.",
                "**Regularisers** such as entropy bonuses (e.g. in reinforcement-learning policies) directly use $H(p)$ to keep a learned distribution from collapsing prematurely.",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u4-l6",
      title: "Restricted Boltzmann Machines & Deep Belief Networks",
      subtitle: "Energy-based bipartite machines trained by Contrastive Divergence — then stacked greedily into DBNs.",
      minutes: 22,
      sections: [
        {
          id: "u4-l6-s1",
          title: "RBM structure",
          blocks: [
            {
              type: "text",
              value:
                "An RBM is an **energy-based, undirected, probabilistic model** with two layers (Fig. 6.1 — fully bipartite-connected, no intra-layer edges):",
            },
            {
              type: "bullets",
              items: [
                "**Visible layer $v$** — the observed data (e.g. pixel values).",
                "**Hidden layer $h$** — latent feature detectors.",
                "**“Restricted”** means connections exist **only between the two layers (bipartite)** — no visible-visible or hidden-hidden connections. This restriction is exactly what will make inference tractable.",
              ],
            },
          ],
        },
        {
          id: "u4-l6-s2",
          title: "Energy function and joint probability",
          blocks: [
            { type: "text", value: "Every configuration $(v,h)$ is assigned an energy:" },
            {
              type: "formula",
              tex: "E(v,h) = -\\sum_i a_i v_i - \\sum_j b_j h_j - \\sum_{i,j} v_i h_j W_{ij}",
              caption: "RBM energy — biases plus a bilinear interaction term",
            },
            {
              type: "text",
              value:
                "where $a, b$ are visible / hidden biases and $W$ is the weight matrix. The probability of a configuration follows the **Boltzmann (Gibbs) distribution** — exactly the maximum-entropy form derived in Lesson 5:",
            },
            {
              type: "formula",
              tex: "P(v,h) = \\frac{\\exp(-E(v,h))}{Z}, \\qquad Z = \\sum_{v,h} \\exp(-E(v,h))",
              caption: "Boltzmann distribution with partition function Z",
            },
            {
              type: "bullets",
              items: [
                "**Significance:** lower energy ⇒ higher probability. Training adjusts $W, a, b$ so that configurations resembling the training data get low energy (high probability) and everything else gets high energy.",
                "$Z$ (the partition function) sums over **ALL possible $(v,h)$** — exponentially many — so it is **intractable** to compute directly. This motivates Contrastive Divergence, which sidesteps ever needing $Z$.",
              ],
            },
          ],
        },
        {
          id: "u4-l6-s3",
          title: "Deriving the conditional probabilities",
          blocks: [
            {
              type: "text",
              value:
                "Because there are no intra-layer connections, we can show the hidden units are **conditionally independent given $v$**.",
            },
            {
              type: "example",
              title: "Deriving P(h_j = 1 | v) and P(v_i = 1 | h)",
              steps: [
                {
                  label: "Step 1 — Regroup the energy so every term involving h_j is collected together",
                  blocks: [
                    {
                      type: "formula",
                      tex: "E(v,h) = -a^\\top v - \\sum_j h_j\\left(b_j + \\sum_i v_i W_{ij}\\right)",
                    },
                  ],
                },
                {
                  label:
                    "Step 2 — Substitute into P(v,h) ∝ exp(−E(v,h)); since the exponent is now a SUM over j, the exponential FACTORISES into a product over j",
                  blocks: [
                    {
                      type: "formula",
                      tex: "P(v,h) \\propto \\exp(a^\\top v) \\times \\prod_j \\exp\\left(h_j\\left(b_j + \\sum_i v_i W_{ij}\\right)\\right)",
                    },
                    {
                      type: "text",
                      value:
                        "This product-over-$j$ form means, given $v$, every $h_j$ is independent of every other $h_k$ — a direct consequence of the “restricted” (bipartite) structure.",
                    },
                  ],
                },
                {
                  label:
                    "Step 3 — Each factor is an unnormalised Bernoulli variable in h_j ∈ {0,1}; normalising it over h_j = 0 and 1 gives the logistic sigmoid",
                  blocks: [
                    {
                      type: "formula",
                      tex: "P(h_j = 1 \\mid v) = \\sigma\\left(b_j + \\sum_i v_i W_{ij}\\right)",
                      caption: "Hidden unit activation — bottom-up",
                    },
                    {
                      type: "formula",
                      tex: "P(v_i = 1 \\mid h) = \\sigma\\left(a_i + \\sum_j h_j W_{ij}\\right)",
                      caption: "Visible unit activation — by the symmetric argument",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "Significance",
              blocks: [
                {
                  type: "text",
                  value:
                    "This gives simple, exact, closed-form sampling in **both directions** ($v \\to h$ and $h \\to v$) — exactly what is needed for the Gibbs sampling inside Contrastive Divergence below.",
                },
              ],
            },
            {
              type: "example",
              title: "Worked Example 6.1 — Energy and Conditional Probability of an RBM",
              given: [
                "A tiny RBM has $v = [1, 1]$, $h = [1]$.",
                "Weight $W = [0.4, 0.6]^\\top$, visible bias $a = [0.1, 0.2]$, hidden bias $b = 0.3$.",
                "Find $E(v,h)$ and $P(h=1|v)$.",
              ],
              steps: [
                {
                  label: "Step 1 — Visible-bias term",
                  blocks: [{ type: "formula", tex: "-a^\\top v = -(0.1 \\times 1 + 0.2 \\times 1) = -0.3" }],
                },
                {
                  label: "Step 2 — Hidden-bias term",
                  blocks: [{ type: "formula", tex: "-b^\\top h = -(0.3 \\times 1) = -0.3" }],
                },
                {
                  label: "Step 3 — Interaction term",
                  blocks: [
                    { type: "formula", tex: "-v^\\top W h = -(1 \\times 0.4 \\times 1 + 1 \\times 0.6 \\times 1) = -1.0" },
                  ],
                },
                {
                  label: "Step 4 — Total energy",
                  blocks: [{ type: "formula", tex: "E(v,h) = -0.3 - 0.3 - 1.0 = -1.6" }],
                },
                {
                  label: "Step 5 — Conditional probability P(h=1|v), using the sigmoid formula just derived",
                  blocks: [
                    {
                      type: "formula",
                      tex: "P(h=1 \\mid v) = \\sigma(0.3 + 1 \\times 0.4 + 1 \\times 0.6) = \\sigma(1.3) = \\frac{1}{1 + e^{-1.3}} = 0.7858",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "The low (negative) energy −1.6 corresponds to a relatively probable / compatible configuration. $P(h=1|v) = 0.786$ says that given this visible pattern, the hidden unit is quite likely to activate — it has “recognised” something in $v$.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l6-s4",
          title: "Training RBMs — Contrastive Divergence (CD-k)",
          blocks: [
            {
              type: "text",
              value:
                "The exact gradient of the log-likelihood has a clean form but an intractable piece:",
            },
            {
              type: "formula",
              tex: "\\frac{\\partial \\log P(v)}{\\partial W_{ij}} = \\langle v_i h_j \\rangle_{data} - \\langle v_i h_j \\rangle_{model}",
              caption: "Data correlations minus model correlations",
            },
            {
              type: "bullets",
              items: [
                "**Positive phase $\\langle v_i h_j \\rangle_{data}$: easy** — clamp $v$ to a training example and compute $P(h|v)$ directly (the sigmoid formula above).",
                "**Negative phase $\\langle v_i h_j \\rangle_{model}$: hard** — needs samples from the model's own equilibrium distribution, which exactly needs $Z$ — intractable.",
                "**Contrastive Divergence (Hinton, 2002):** approximate the negative phase using only **$k$ steps of block Gibbs sampling, starting the chain from the training example itself** (instead of running to equilibrium). **CD-1 ($k=1$) is used in practice and works remarkably well.**",
              ],
            },
            { type: "heading", value: "The CD-1 algorithm" },
            {
              type: "numbered",
              items: [
                "Start with a training vector $v^0$.",
                "Compute $P(h^0|v^0)$ using the sigmoid formula; sample / obtain $h^0$ (**positive phase**).",
                "Compute $P(v^1|h^0)$; this “reconstruction” $v^1$ is the model's guess at regenerating $v^0$.",
                "Compute $P(h^1|v^1)$ (**negative phase**).",
                "Update weights and biases:",
              ],
            },
            {
              type: "formula",
              tex: "\\Delta W_{ij} = \\eta\\left(v_i^0 h_j^0 - v_i^1 h_j^1\\right), \\qquad \\Delta a_i = \\eta\\left(v_i^0 - v_i^1\\right), \\qquad \\Delta b_j = \\eta\\left(h_j^0 - h_j^1\\right)",
              caption: "CD-1 update rules — positive-phase statistics minus negative-phase statistics",
            },
            {
              type: "example",
              title: "Worked Example 6.2 — One Step of CD-1 (single visible / single hidden unit, for clarity)",
              given: [
                "$v^0 = 1$, weight $W = 0.5$, biases $= 0$, learning rate $\\eta = 0.1$.",
                "Perform one CD-1 update of $W$.",
              ],
              steps: [
                {
                  label: "Step 1 — Positive phase: probability hidden unit turns on, given the data",
                  blocks: [
                    { type: "formula", tex: "h^0 = P(h=1 \\mid v^0) = \\sigma(1 \\times 0.5) = \\sigma(0.5) = 0.6225" },
                  ],
                },
                {
                  label: "Step 2 — Reconstruction: probability visible unit turns back on, given h⁰ (the model “imagining” the data back)",
                  blocks: [
                    { type: "formula", tex: "v^1 = P(v=1 \\mid h^0) = \\sigma(0.6225 \\times 0.5) = \\sigma(0.3113) = 0.5773" },
                  ],
                },
                {
                  label: "Step 3 — Negative phase: probability hidden unit turns on, given the reconstruction",
                  blocks: [
                    { type: "formula", tex: "h^1 = P(h=1 \\mid v^1) = \\sigma(0.5773 \\times 0.5) = \\sigma(0.2887) = 0.5717" },
                  ],
                },
                {
                  label: "Step 4 — CD-1 weight update (positive-phase correlation minus negative-phase correlation)",
                  blocks: [
                    {
                      type: "formula",
                      tex: "\\Delta W = \\eta(v^0 h^0 - v^1 h^1) = 0.1 \\times (1 \\times 0.6225 - 0.5773 \\times 0.5717) = 0.1 \\times (0.6225 - 0.3300) = 0.02925",
                    },
                    { type: "formula", tex: "W_{new} = 0.5 + 0.02925 = 0.52925" },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "The positive-phase correlation (0.6225) exceeds the negative / reconstruction-phase correlation (0.3300), so $W$ is increased — the model strengthens this v–h connection to make the real data configuration more probable (lower energy) relative to what it currently “fantasises” / reconstructs.",
                },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Exam pointer",
              blocks: [
                {
                  type: "text",
                  value:
                    "Be able to state the exact gradient $\\langle v_ih_j\\rangle_{data} - \\langle v_ih_j\\rangle_{model}$, explain why the negative phase is intractable (it needs $Z$), and carry out a CD-1 numerical exactly like Example 6.2 — including the update $\\Delta W = \\eta(v^0h^0 - v^1h^1)$.",
                },
              ],
            },
            {
              type: "widget",
              widgetId: "u4-rbm-lab",
              title: "RBM energy & CD-1 lab",
              description:
                "Set weights and biases, read off the energy E(v,h), sample hidden and visible units in both directions, and run one CD-1 update exactly as in Worked Example 6.2.",
            },
          ],
        },
        {
          id: "u4-l6-s5",
          title: "Deep Belief Networks (DBN): stacking RBMs",
          blocks: [
            {
              type: "bullets",
              items: [
                "A DBN **stacks several RBMs**: $v \\to h^1 \\to h^2 \\to h^3 \\dots$",
                "Only the **top two layers remain an undirected RBM**; all lower connections become **directed, pointing downward** (a “sigmoid belief network”).",
                "This mixed directed / undirected structure is what distinguishes a DBN from a **Deep Boltzmann Machine** (Lesson 7, which is fully undirected).",
              ],
            },
            { type: "heading", value: "Greedy layer-wise pretraining" },
            {
              type: "numbered",
              items: [
                "Train $RBM_1$ on the raw data $v$ using CD, learning $h^1$.",
                "**Freeze $RBM_1$.** Treat $P(h^1|v)$ (or samples from it) as “data” and train $RBM_2$ on top of it, learning $h^2$.",
                "Repeat, adding one RBM / layer at a time — each new layer is trained on the activations of the previous, already-fixed layer.",
                "Optionally **fine-tune** the whole stack afterward (e.g. wake-sleep algorithm, or backpropagation if a classifier layer is attached on top).",
                "Because each layer is trained one at a time on a shallow (1-layer) problem, this **avoids the vanishing-gradient difficulty** of training a deep directed network from scratch — historically the technique that first made training deep networks practical.",
              ],
            },
            {
              type: "quiz",
              items: [
                {
                  id: "u4-check-3",
                  question:
                    "In a Restricted Boltzmann Machine (RBM), which connections are disallowed by the “restricted” structure?",
                  options: [
                    "Visible-to-hidden connections",
                    "Both visible-visible AND hidden-hidden (intra-layer) connections",
                    "Only hidden-to-hidden connections — visible-visible is allowed",
                    "All connections of every kind are disallowed",
                  ],
                  correct: 1,
                  explanation:
                    "An RBM is strictly bipartite — no v-v or h-h edges — which is exactly what makes P(h|v) and P(v|h) factorise into simple, independent sigmoids.",
                },
                {
                  id: "u4-check-4",
                  question:
                    "In the CD-1 algorithm, the negative-phase statistics ⟨v_i h_j⟩ are approximated using:",
                  options: [
                    "Samples drawn after running the Gibbs chain all the way to equilibrium",
                    "One step of block Gibbs sampling started from the training example itself",
                    "Random noise unrelated to the data",
                    "The partition function Z, computed exactly",
                  ],
                  correct: 1,
                  explanation:
                    "Contrastive Divergence starts the chain from the training vector v⁰ and runs only k = 1 Gibbs step (giving v¹h¹), which sidesteps the need for the intractable Z.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l6-s6",
          title: "Applications",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Unsupervised pretraining / weight initialisation** for deep networks (historically important in the pre-ReLU / pre-BatchNorm era).",
                "**Dimensionality reduction, collaborative filtering** — RBMs were used in the Netflix Prize.",
                "**Feature learning** followed by a supervised classifier on top of the learned $h$.",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u4-l7",
      title: "Deep Boltzmann Machines (DBM)",
      subtitle: "All connections undirected — one global energy, top-down feedback, and mean-field inference.",
      minutes: 14,
      sections: [
        {
          id: "u4-l7-s1",
          title: "How a DBM differs from a DBN",
          blocks: [
            {
              type: "bullets",
              items: [
                "A DBM also stacks multiple hidden layers: $v \\leftrightarrow h^1 \\leftrightarrow h^2 \\leftrightarrow \\dots$, but **every connection remains undirected** — unlike a DBN, where only the top pair of layers is undirected.",
                "This makes a DBM a genuine, fully-fledged Boltzmann distribution across all layers (**a single global energy function**), whereas a DBN is a hybrid directed / undirected model.",
                "**Consequence:** in a DBM, information can flow **both bottom-up and top-down during inference** — a hidden unit's belief depends on evidence from the layer below AND the layer above simultaneously. This lets top layers refine / disambiguate what lower layers think they saw.",
              ],
            },
            {
              type: "widget",
              widgetId: "u4-dbn-dbm",
              title: "DBN vs DBM — structure explorer",
              description:
                "Compare the DBN's directed lower layers with the fully undirected DBM side by side, and trace how information flows bottom-up and top-down in each.",
            },
          ],
        },
        {
          id: "u4-l7-s2",
          title: "The energy function of a DBM",
          blocks: [
            {
              type: "text",
              value:
                "For a DBM with one visible layer and two hidden layers $(v, h^1, h^2)$, the energy simply adds one more interaction term per extra layer:",
            },
            {
              type: "formula",
              tex: "E(v, h^1, h^2) = -a^\\top v - b^{1\\top} h^1 - b^{2\\top} h^2 - v^\\top W^1 h^1 - h^{1\\top} W^2 h^2",
              caption: "DBM energy — one interaction term and one bias per adjacent layer pair",
            },
            {
              type: "bullets",
              items: [
                "$a, b^1, b^2$: bias terms for $v, h^1, h^2$ respectively.",
                "$W^1$: weights between $v$ and $h^1$ — exactly like a single RBM.",
                "$W^2$: weights between $h^1$ and $h^2$ — a second RBM stacked on the first, but here kept undirected and trained / used **jointly**, not just stacked greedily.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              title: "The pattern to remember",
              blocks: [
                {
                  type: "text",
                  value:
                    "Every adjacent pair of layers contributes exactly one $-(\\text{layer})^\\top W (\\text{layer})$ interaction term, plus one bias term per layer — this generalises directly to any number of hidden layers.",
                },
              ],
            },
            {
              type: "example",
              title: "Worked Example 7.1 — Extending an RBM Energy to a DBM by Adding a Layer",
              given: [
                "Recall Worked Example 6.1: an RBM with $v=[1,1]$, $h^1=[1]$, $W^1=[0.4,0.6]^\\top$, $a=[0.1,0.2]$, $b^1=0.3$ had energy $E = -1.6$.",
                "Now add a second hidden unit $h^2 = 1$ on top, with weight $W^2 = 0.5$ (connecting $h^1$ to $h^2$) and bias $b^2 = 0.1$.",
                "Find the new DBM energy.",
              ],
              steps: [
                {
                  label: "Step 1 — The v–h¹ part of the energy is unchanged from Example 6.1",
                  blocks: [
                    { type: "formula", tex: "-a^\\top v - b^{1\\top} h^1 - v^\\top W^1 h^1 = -1.6 \\;\\;(\\text{from before})" },
                  ],
                },
                {
                  label: "Step 2 — New h¹–h² interaction term",
                  blocks: [{ type: "formula", tex: "-h^{1\\top} W^2 h^2 = -(1 \\times 0.5 \\times 1) = -0.5" }],
                },
                {
                  label: "Step 3 — New h² bias term",
                  blocks: [{ type: "formula", tex: "-b^{2\\top} h^2 = -(0.1 \\times 1) = -0.1" }],
                },
                {
                  label: "Step 4 — Total DBM energy = old RBM energy + new terms",
                  blocks: [
                    { type: "formula", tex: "E(v, h^1, h^2) = -1.6 + (-0.5) + (-0.1) = -2.2" },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "Adding a compatible second layer (positive $W^2$, $h^2 = 1$ matching a high $P(h^1=1|\\cdot)$) further LOWERS the energy — i.e. increases the probability of this joint configuration. This is exactly how deeper layers refine / reinforce the model's belief about the input.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l7-s3",
          title: "Why exact inference is intractable — the mean-field approximation",
          blocks: [
            {
              type: "bullets",
              items: [
                "In a single RBM, $P(h|v)$ factorises exactly (Lesson 6) because $h$ has no other neighbours.",
                "In a DBM, $h^1$ is now **sandwiched** between $v$ and $h^2$ — $P(h^1|v,h^2)$ is easy, but the joint posterior $P(h^1,h^2|v)$ needed for learning **no longer factorises**, because $h^1$ and $h^2$ become statistically dependent once $v$ is observed (a classic **“explaining-away”** effect). Exact inference would need summing over exponentially many hidden configurations.",
                "**Solution: mean-field variational inference** — approximate the true posterior with a simple FACTORISED distribution, governed by parameters $\\mu^1_i = q(h^1_i = 1)$ and $\\mu^2_k = q(h^2_k = 1)$:",
              ],
            },
            {
              type: "formula",
              tex: "Q(h^1, h^2) = \\prod_i q(h^1_i) \\cdot \\prod_k q(h^2_k)",
              caption: "The factorised mean-field approximation of the posterior",
            },
            {
              type: "text",
              value:
                "These are updated by iterating **fixed-point equations** until convergence, each unit's estimate combining evidence from both neighbouring layers:",
            },
            {
              type: "formula",
              tex: "\\mu^1_j \\leftarrow \\sigma\\left(\\sum_i v_i W^1_{ij} + \\sum_k \\mu^2_k W^2_{jk}\\right)",
              caption: "Mean-field fixed-point update for the first hidden layer",
            },
            {
              type: "callout",
              variant: "key",
              title: "The signature of top-down feedback",
              blocks: [
                {
                  type: "text",
                  value:
                    "Compare this to the RBM update (Lesson 6): it is the **same sigmoid rule, but now with an extra term from the layer above** — this is precisely the mathematical signature of “top-down feedback” that a DBN (with its directed lower layers) does not have.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l7-s4",
          title: "DBN vs DBM — summary comparison",
          blocks: [
            {
              type: "table",
              headers: ["Aspect", "Deep Belief Network (DBN)", "Deep Boltzmann Machine (DBM)"],
              rows: [
                [
                  "Connection type",
                  "Top 2 layers undirected; lower layers directed (top-down)",
                  "All layers undirected",
                ],
                [
                  "Inference",
                  "Fast, single top-down pass (approximate)",
                  "Iterative mean-field (both directions), slower",
                ],
                [
                  "Training",
                  "Greedy layer-wise CD, layer-by-layer",
                  "Greedy pretraining, then joint fine-tuning of all layers together",
                ],
                [
                  "Information flow",
                  "One-directional (generative, top-down)",
                  "Bidirectional — top layers can revise lower-layer beliefs",
                ],
                [
                  "Robustness",
                  "More sensitive to ambiguous / noisy input",
                  "More robust — top-down feedback helps disambiguate input",
                ],
              ],
              caption: "The exam-favourite DBN vs DBM table.",
            },
          ],
        },
        {
          id: "u4-l7-s5",
          title: "Applications",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Joint modelling of multi-modal data** (e.g. images + text tags) where top-down context genuinely helps interpret ambiguous input.",
                "**Robust feature extraction** under noise / occlusion.",
                "Historically important as a **stepping stone toward modern deep generative models** (VAE, GAN, diffusion models).",
              ],
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "u4-l8",
      title: "Convolutional Boltzmann Machines",
      subtitle: "Weight sharing meets energy models — detection, probabilistic pooling, and a 313× parameter cut.",
      minutes: 16,
      sections: [
        {
          id: "u4-l8-s1",
          title: "Motivation",
          blocks: [
            {
              type: "bullets",
              items: [
                "A plain RBM / DBM connects **every visible unit to every hidden unit** — for a realistic image this is enormous (see the parameter count below) and it **ignores the 2-D spatial structure** of images entirely.",
                "**Convolutional Boltzmann Machines** (also called Convolutional Deep Belief Networks, Lee et al.) apply the same **weight-sharing / local-receptive-field** idea used in CNNs, but inside the energy-based, probabilistic RBM / DBN framework.",
                "Benefits, exactly as in CNNs: **far fewer parameters**, **translation invariance** (a learned feature detector fires wherever the pattern appears in the image), and **scalability to large images**.",
              ],
            },
          ],
        },
        {
          id: "u4-l8-s2",
          title: "Architecture",
          blocks: [
            {
              type: "text",
              value:
                "**(Fig. 8.1)** A shared filter $K$ slides over the input to produce a **detection (feature-map) layer**, which is then probabilistically pooled:",
            },
            {
              type: "bullets",
              items: [
                "**Detection layer:** one feature map per filter; every unit in a feature map **shares the same weights $K$ and bias** — this is the weight-sharing step.",
                "**Pooling layer:** shrinks each feature map (e.g. 2×2 blocks → 1 unit) using **probabilistic max-pooling**, which keeps the whole model a valid, properly normalisable energy-based (Boltzmann) model — unlike a deterministic CNN max-pool.",
              ],
            },
          ],
        },
        {
          id: "u4-l8-s3",
          title: "Weight sharing — the convolution operation",
          blocks: [
            {
              type: "text",
              value:
                "Each detection-layer unit's input is a **convolution** of the shared filter $K$ with a local patch of $v$:",
            },
            {
              type: "formula",
              tex: "(K * v)_{ij} = \\sum_{m,n} K_{mn}\\, v_{(i+m)(j+n)}",
              caption: "The convolution operation",
            },
            {
              type: "text",
              value:
                "The pre-activation of detection unit $(i,j)$ in feature map $k$ then uses this convolution plus **one shared bias $b_k$** (not one bias per position):",
            },
            {
              type: "formula",
              tex: "P\\left(h^k_{ij} = 1 \\mid v\\right) = \\sigma\\left((K_k * v)_{ij} + b_k\\right)",
              caption: "Detection-unit activation — same K, b at every position",
            },
            {
              type: "callout",
              variant: "key",
              title: "Significance",
              blocks: [
                {
                  type: "text",
                  value:
                    "Because $K^k$ and $b_k$ do not depend on $(i,j)$, the SAME small set of parameters is reused at every spatial location — this is what gives **translation invariance** and the **huge parameter reduction** (quantified below).",
                },
              ],
            },
            {
              type: "example",
              title: "Worked Example 8.1 — Convolution for the Detection Layer",
              given: [
                "Input image (3×3): $v = [[1,0,1],[1,1,0],[0,1,1]]$.",
                "Shared filter (2×2): $K = [[1,0],[0,1]]$. Stride 1, no padding.",
                "Find the detection-layer (feature-map) values, then apply a shared bias $b = -1.5$ to get activation probabilities.",
              ],
              steps: [
                {
                  label: "Step 1 — Output size",
                  blocks: [
                    {
                      type: "text",
                      value:
                        "With a 3×3 input and 2×2 filter, stride 1, valid convolution gives a $(3-2+1) \\times (3-2+1) = 2 \\times 2$ feature map.",
                    },
                  ],
                },
                {
                  label:
                    "Step 2 — Slide K over v; since K picks out the top-left and bottom-right of each 2×2 patch (K is identity-like), each output = v(i,j) + v(i+1,j+1)",
                  blocks: [
                    {
                      type: "formula",
                      tex: "out(0,0) = v(0,0) + v(1,1) = 1 + 1 = 2",
                    },
                    { type: "formula", tex: "out(0,1) = v(0,1) + v(1,2) = 0 + 0 = 0" },
                    { type: "formula", tex: "out(1,0) = v(1,0) + v(2,1) = 1 + 1 = 2" },
                    { type: "formula", tex: "out(1,1) = v(1,1) + v(2,2) = 1 + 1 = 2" },
                  ],
                },
                {
                  label: "Step 3 — Feature map (before activation)",
                  blocks: [{ type: "formula", tex: "(K * v) = [[2, 0], [2, 2]]" }],
                },
                {
                  label: "Step 4 — Add the ONE shared bias b = −1.5 to every position, then apply sigmoid to get firing probabilities",
                  blocks: [
                    {
                      type: "formula",
                      tex: "P(h_{00}=1 \\mid v) = \\sigma(2 - 1.5) = \\sigma(0.5) = 0.6225, \\qquad P(h_{01}=1 \\mid v) = \\sigma(0 - 1.5) = \\sigma(-1.5) = 0.1824",
                    },
                    {
                      type: "formula",
                      tex: "P(h_{10}=1 \\mid v) = \\sigma(2 - 1.5) = 0.6225, \\qquad P(h_{11}=1 \\mid v) = \\sigma(2 - 1.5) = 0.6225",
                    },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation — translation invariance in action",
              blocks: [
                {
                  type: "text",
                  value:
                    "Positions (0,0), (1,0) and (1,1) all produced the same raw score (2) because the SAME filter detected the SAME local diagonal pattern $[1, \\cdot\\,; \\cdot, 1]$ at each — this is translation invariance in action. Position (0,1) had a mismatched patch and scored 0, giving a low firing probability (0.18).",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l8-s4",
          title: "Probabilistic max-pooling",
          blocks: [
            {
              type: "bullets",
              items: [
                "Ordinary CNN max-pooling just takes $\\max(\\cdot)$ **deterministically** — it has no probabilistic interpretation and cannot be plugged into an energy function.",
                "Probabilistic max-pooling instead groups a small block (say 2×2) of detection units $\\{h_1, h_2, h_3, h_4\\}$ with one pooling unit $p$, and defines a **joint (softmax-style) distribution over the 5 possible states** — exactly one detection unit $h_c = 1$ with $p = 1$, OR all $h_c = 0$ with $p = 0$ — so it stays a valid, normalisable part of the Boltzmann energy function:",
              ],
            },
            {
              type: "formula",
              tex: "P(p = 1 \\mid v) = 1 - P(\\text{all } h_i = 0 \\mid v)",
              caption: "p fires if ANY unit in its block fires",
            },
            {
              type: "text",
              value:
                "This keeps the whole architecture a proper probabilistic (Boltzmann) model with a well-defined energy function, while still achieving the same practical effect as CNN pooling: a smaller, spatially-invariant summary of each region.",
            },
          ],
        },
        {
          id: "u4-l8-s5",
          title: "Parameter efficiency — weight sharing vs fully-connected",
          blocks: [
            {
              type: "example",
              title: "Worked Example 8.2 — Parameter Count: Fully-Connected RBM vs Convolutional RBM",
              given: [
                "Compare a fully-connected RBM with 100 hidden units on a 28×28 image,",
                "against a convolutional RBM with 10 filters of size 5×5.",
              ],
              steps: [
                {
                  label:
                    "Step 1 — Fully-connected RBM: every one of the 784 visible units connects to every one of the 100 hidden units",
                  blocks: [
                    { type: "formula", tex: "784 \\times 100 = 78{,}400 \\text{ weight parameters}" },
                  ],
                },
                {
                  label: "Step 2 — Convolutional RBM: 10 filters, each only 5×5, shared across all positions",
                  blocks: [
                    {
                      type: "formula",
                      tex: "10 \\times (5 \\times 5) = 250 \\text{ weight parameters } (+10 \\text{ shared biases})",
                    },
                  ],
                },
                {
                  label: "Step 3 — Reduction factor",
                  blocks: [
                    { type: "formula", tex: "78{,}400 / 250 \\approx 313.6\\times \\text{ fewer weights}" },
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "info",
              title: "Interpretation",
              blocks: [
                {
                  type: "text",
                  value:
                    "Over 300× fewer parameters for a comparable (indeed typically much richer, since convolution can be applied at every position) feature-detection capacity — this is the core practical reason convolutional variants scale to real images while fully-connected RBM / DBM / DBN do not.",
                },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Exam pointer",
              blocks: [
                {
                  type: "text",
                  value:
                    "Parameter-count comparisons like Example 8.2 are common numericals: multiply it out (784 × 100 = 78,400 vs 10 × 25 = 250) and state the reduction factor (≈313.6×) together with the two qualitative wins of sharing — translation invariance and scalability.",
                },
              ],
            },
          ],
        },
        {
          id: "u4-l8-s6",
          title: "Applications",
          blocks: [
            {
              type: "bullets",
              items: [
                "**Hierarchical unsupervised feature learning directly from images** (edges → motifs → object parts, layer by layer, exactly like a supervised CNN but learned without labels).",
                "**Pretraining convolutional feature extractors** before supervised fine-tuning.",
                "**Generative modelling / in-painting** of image data at larger resolution than fully-connected RBM / DBM / DBN can practically handle.",
              ],
            },
          ],
        },
        {
          id: "u4-l8-s7",
          title: "The whole unit at a glance — quick revision",
          blocks: [
            {
              type: "text",
              value:
                "Section 9 of the notes closes the unit with two revision aids: the side-by-side comparison of all seven models, and the quick formula sheet.",
            },
            {
              type: "table",
              headers: ["Model", "Directed / Undirected", "Training", "Latent Variable", "Typical Use"],
              rows: [
                [
                  "Autoencoder",
                  "Deterministic (neither)",
                  "Backprop, minimise $\\|x - \\hat{x}\\|^2$",
                  "Deterministic code $z$",
                  "Compression, denoising, pretraining",
                ],
                [
                  "VAE",
                  "Directed, probabilistic",
                  "Backprop on ELBO (reparameterization trick)",
                  "Continuous $z$, prior $N(0,I)$",
                  "Generation with smooth latent space",
                ],
                [
                  "GAN",
                  "Implicit (adversarial)",
                  "Minimax game, alternating gradient steps",
                  "Noise $z$ (no structure imposed)",
                  "High-fidelity sample generation",
                ],
                [
                  "RBM",
                  "Undirected, energy-based",
                  "Contrastive Divergence (CD-k)",
                  "Binary stochastic $h$",
                  "Feature learning, pretraining",
                ],
                [
                  "DBN",
                  "Hybrid: top layer undirected, rest directed",
                  "Greedy layer-wise CD, then fine-tune",
                  "Stacked $h^1, h^2, \\dots$",
                  "Pretraining deep nets, classification",
                ],
                [
                  "DBM",
                  "Fully undirected",
                  "Greedy pretrain + joint mean-field fine-tune",
                  "Stacked $h^1, h^2, \\dots$ (bidirectional)",
                  "Robust joint / multi-modal modelling",
                ],
                [
                  "ConvBM",
                  "Undirected, weight-shared",
                  "CD + probabilistic max-pooling",
                  "Spatial feature maps",
                  "Hierarchical image feature learning",
                ],
              ],
              caption: "All seven models of Unit 4, side by side.",
            },
            { type: "heading", value: "Quick formula sheet" },
            {
              type: "formula",
              tex: "z = \\sigma(Wx + b), \\quad \\hat{x} = \\sigma(W'z + b'), \\quad L = \\frac{1}{n}\\sum_i (x_i - \\hat{x}_i)^2",
              caption: "Autoencoder",
            },
            {
              type: "formula",
              tex: "z = \\mu + \\sigma \\odot \\varepsilon, \\quad L = -\\mathbb{E}[\\log p(x|z)] + KL(q(z|x) \\,\\|\\, p(z)), \\quad KL = \\tfrac{1}{2}(\\mu^2 + \\sigma^2 - \\ln\\sigma^2 - 1)",
              caption: "VAE",
            },
            {
              type: "formula",
              tex: "\\min_G \\max_D \\; \\mathbb{E}[\\log D(x)] + \\mathbb{E}[\\log(1 - D(G(z)))], \\qquad D^*(x) = \\frac{p_{data}}{p_{data} + p_g}",
              caption: "GAN",
            },
            {
              type: "formula",
              tex: "H(p) = -\\sum p \\log p; \\quad \\text{no constraint} \\to \\text{uniform}; \\quad \\text{mean + variance constraint} \\to \\text{Gaussian}",
              caption: "Maximum Entropy",
            },
            {
              type: "formula",
              tex: "E(v,h) = -a^\\top v - b^\\top h - v^\\top W h, \\quad P(h_j = 1 \\mid v) = \\sigma\\!\\left(b_j + \\sum_i v_i W_{ij}\\right), \\quad \\Delta W = \\eta\\left(\\langle vh \\rangle_{data} - \\langle vh \\rangle_{recon}\\right)",
              caption: "RBM / DBN / DBM",
            },
            {
              type: "formula",
              tex: "P\\left(h^k_{ij} = 1 \\mid v\\right) = \\sigma\\left((K_k * v)_{ij} + b_k\\right)",
              caption: "Convolutional BM — same K, b shared at every (i, j)",
            },
            {
              type: "callout",
              variant: "info",
              title: "Where to read more (references behind this unit)",
              blocks: [
                {
                  type: "bullets",
                  items: [
                    "Goodfellow, Bengio & Courville (2016), *Deep Learning*, MIT Press.",
                    "Goodfellow et al. (2014), *Generative Adversarial Networks*, NeurIPS.",
                    "Kingma & Welling (2014), *Auto-Encoding Variational Bayes*, ICLR.",
                    "Hinton (2002), *Training Products of Experts by Minimizing Contrastive Divergence*, Neural Computation.",
                    "Hinton, Osindero & Teh (2006), *A Fast Learning Algorithm for Deep Belief Nets*, Neural Computation.",
                    "Salakhutdinov & Hinton (2009), *Deep Boltzmann Machines*, AISTATS.",
                    "Lee, Grosse, Ranganath & Ng (2009), *Convolutional Deep Belief Networks for Scalable Unsupervised Learning*, ICML.",
                    "Jaynes (1957), *Information Theory and Statistical Mechanics*, Physical Review.",
                    "Bishop (2006), *Pattern Recognition and Machine Learning*, Springer.",
                    "Vincent et al. (2008), *Extracting and Composing Robust Features with Denoising Autoencoders*, ICML.",
                  ],
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
      id: "u4-q1",
      question: "What is the primary purpose of the bottleneck (latent) layer in an autoencoder?",
      options: [
        "To increase the model's raw capacity",
        "To force the network to learn a compressed, useful representation of the input",
        "To add regularisation noise to the gradients",
        "To speed up training regardless of representation quality",
      ],
      correct: 1,
      explanation:
        "The bottleneck is narrower than the input, so the network cannot simply copy — it must retain only the most important information to reconstruct x, which is exactly what makes the learned code z useful.",
    },
    {
      id: "u4-q2",
      question: "In an undercomplete autoencoder, the dimensionality of the hidden (latent) layer is:",
      options: [
        "Greater than the input dimension",
        "Equal to the input dimension",
        "Less than the input dimension",
        "Always exactly 1, regardless of input size",
      ],
      correct: 2,
      explanation:
        "“Undercomplete” means the code is lower-dimensional than the input — this is what forces compression.",
    },
    {
      id: "u4-q3",
      question: "A denoising autoencoder is trained so that it learns to:",
      options: [
        "Add noise to a clean output",
        "Reconstruct the clean original input from a corrupted / noisy version of it",
        "Maximise its own reconstruction error",
        "Operate without any decoder network",
      ],
      correct: 1,
      explanation:
        "The input is corrupted (x̃) before encoding, but the training target is still the original clean x — this forces genuinely robust features rather than trivial pixel-copying.",
    },
    {
      id: "u4-q4",
      question: "In a Variational Autoencoder, the prior distribution p(z) over the latent variable is typically chosen to be:",
      options: [
        "Uniform(0, 1)",
        "A standard normal distribution N(0, I)",
        "A Bernoulli distribution",
        "Left completely unspecified / learned with no constraint",
      ],
      correct: 1,
      explanation:
        "N(0, I) is simple, easy to sample from, and the KL term in the ELBO pulls q_φ(z|x) toward it, which is what fills the latent space smoothly for generation.",
    },
    {
      id: "u4-q5",
      question: "The reparameterization trick in a VAE is used primarily to:",
      options: [
        "Reduce the total number of network parameters",
        "Make the random sampling step differentiable so gradients can flow back through it",
        "Remove the need for a decoder network entirely",
        "Convert the continuous latent variable into a discrete one",
      ],
      correct: 1,
      explanation:
        "Writing z = μ + σ ⊙ ε moves the randomness into an external ε, so z becomes a deterministic, differentiable function of μ and σ.",
    },
    {
      id: "u4-q6",
      question: "The ELBO (Evidence Lower Bound) used to train a VAE is made up of which two terms?",
      options: [
        "Cross-entropy loss and L2 weight regularisation",
        "A reconstruction term and a KL-divergence (regularisation) term",
        "Generator loss and discriminator loss",
        "An energy term and the log partition function",
      ],
      correct: 1,
      explanation:
        "ELBO = E_q[log p_θ(x|z)] − KL(q_φ(z|x) ‖ p(z)) — reconstruction quality traded off against closeness to the prior.",
    },
    {
      id: "u4-q7",
      question: "In a GAN, the Generator's training objective is to:",
      options: [
        "Correctly classify samples as real or fake",
        "Produce samples that the Discriminator classifies as real",
        "Directly minimise a pixel-wise reconstruction loss against real data",
        "Maximise the KL divergence between p_g and p_data",
      ],
      correct: 1,
      explanation:
        "G never sees real data directly — it only receives gradient signal through D, pushing it to make D(G(z)) large.",
    },
    {
      id: "u4-q8",
      question:
        "At the theoretical Nash equilibrium of GAN training (when the generator distribution p_g equals p_data), the optimal discriminator output D*(x) equals:",
      options: ["0", "1", "0.5", "It oscillates indefinitely and never settles to a fixed value"],
      correct: 2,
      explanation:
        "D*(x) = p_data(x) / (p_data(x) + p_g(x)); when p_g = p_data this ratio is 1/2 everywhere — the best D can do is a coin flip.",
    },
    {
      id: "u4-q9",
      question: "“Mode collapse” in GAN training refers to the situation where:",
      options: [
        "The discriminator's loss drops to exactly zero",
        "The generator produces only a limited variety of outputs, failing to capture the full diversity of p_data",
        "The generator's weights collapse to all zeros",
        "Training converges in a single gradient step",
      ],
      correct: 1,
      explanation:
        "G finds a small set of outputs that reliably fool D and keeps producing (near-)only those, sacrificing diversity.",
    },
    {
      id: "u4-q10",
      question:
        "According to the Maximum Entropy Principle, given only some known constraints on a distribution, one should choose the distribution that:",
      options: [
        "Has the lowest entropy consistent with the constraints",
        "Has the highest entropy consistent with the constraints",
        "Is always the Gaussian distribution, regardless of the constraints",
        "Minimises the log-likelihood of observed data",
      ],
      correct: 1,
      explanation:
        "Maximum entropy = the least additional, unjustified assumptions beyond what the constraints actually say (Jaynes).",
    },
    {
      id: "u4-q11",
      question:
        "If the only known constraints on a continuous random variable are its mean and variance, the maximum-entropy distribution consistent with them is:",
      options: ["Uniform", "Exponential", "Gaussian (Normal)", "Bernoulli"],
      correct: 2,
      explanation:
        "Solving the constrained optimisation with Lagrange multipliers for mean + variance constraints yields exactly the Gaussian density.",
    },
    {
      id: "u4-q12",
      question: "In a Restricted Boltzmann Machine (RBM), which connections are disallowed by the “restricted” structure?",
      options: [
        "Visible-to-hidden connections",
        "Both visible-visible AND hidden-hidden (intra-layer) connections",
        "Only hidden-to-hidden connections — visible-visible is allowed",
        "All connections of every kind are disallowed",
      ],
      correct: 1,
      explanation:
        "RBM is strictly bipartite — no v-v or h-h edges — which is exactly what makes P(h|v) and P(v|h) factorise into simple, independent sigmoids.",
    },
    {
      id: "u4-q13",
      question: "Deep Belief Networks (DBNs) are classically trained using which strategy?",
      options: [
        "End-to-end backpropagation from random initialisation, with no pretraining",
        "Greedy layer-wise pretraining of stacked RBMs, one layer at a time",
        "A single-shot closed-form least-squares solution",
        "Pure reinforcement learning with a reward signal",
      ],
      correct: 1,
      explanation:
        "Each RBM is trained via CD on the activations of the previous (already-fixed) layer, then optionally the whole stack is fine-tuned.",
    },
    {
      id: "u4-q14",
      question:
        "The key structural difference between a Deep Boltzmann Machine (DBM) and a Deep Belief Network (DBN) is that in a DBM:",
      options: [
        "There are no hidden layers at all",
        "All layer-to-layer connections are undirected, unlike the DBN's mix of directed and undirected connections",
        "There is no visible layer",
        "Only exactly one hidden unit is permitted in total",
      ],
      correct: 1,
      explanation:
        "DBN keeps only the top two layers as an undirected RBM (lower layers directed); DBM keeps every pair of layers undirected, enabling two-way (bottom-up AND top-down) inference.",
    },
    {
      id: "u4-q15",
      question:
        "In a Convolutional Boltzmann Machine, sharing the same filter weights across every spatial location primarily provides:",
      options: [
        "A larger number of parameters for higher model capacity",
        "Translation invariance and a large reduction in the number of parameters",
        "Complete removal of the need for any bias term",
        "A guarantee that training converges in exactly one epoch",
      ],
      correct: 1,
      explanation:
        "The same small filter K (and one shared bias) is reused at every position — a 300×+ parameter reduction versus a fully-connected RBM.",
    },
  ],
};
