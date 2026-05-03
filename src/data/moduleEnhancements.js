export const MODULE_ENHANCEMENTS = {
  "Behaviorism and Philosophical Foundations": [
    {
      // concept[0]: The Goals of Behavior Analysis: Description, Prediction, Control
      example: "Dr. Chen, a BCBA, is reviewing classroom data on Jaylen, a 7-year-old with ADHD. She first describes his out-of-seat behavior precisely — 14 occurrences per 30-minute session. From her functional assessment, she predicts he will leave his seat most during independent seatwork when teacher proximity is low. She then systematically moves the teacher's station closer during seatwork and documents a drop to 3 occurrences, demonstrating experimental control over the variable she identified.",
      keyTerms: [
        { term: "Description", def: "Objective, measurable account of behavior's topography, frequency, or duration." },
        { term: "Prediction", def: "Forecasting when behavior will occur based on known functional relationships." },
        { term: "Control", def: "Demonstrating causation by systematically manipulating an independent variable." },
        { term: "Functional relationship", def: "Reliable, replicable connection between an independent variable and behavior change." }
      ],
      quickCheck: {
        prompt: "A teacher reports that her student 'is more aggressive on rainy days.' Which goal of behavior analysis has she demonstrated, and what's still missing?",
        answer: "She has only demonstrated DESCRIPTION (and possibly weak prediction). She's missing CONTROL — she'd need to systematically manipulate a variable (e.g., remove indoor recess, change schedule) and show aggression reliably changes as a function of that manipulation.",
        hint: "There are three goals — description, prediction, and control. Which one requires you to actually intervene?"
      }
    },
    {
      // concept[1]: Philosophical Assumptions: Determinism, Empiricism, Parsimony, and Philosophic Doubt
      example: "Marcus, a 9-year-old with ASD, begins hitting peers during lunch. A colleague suggests he hits because he 'has poor impulse control.' His BCBA, Dr. Rivera, invokes parsimony and insists on ruling out observable antecedents and consequences before accepting that label. She collects ABC data for two weeks, finds that hitting reliably occurs when Marcus is seated next to a loud peer and is followed by seat relocation, and designs an antecedent intervention — demonstrating that a simpler, environmental explanation was sufficient.",
      keyTerms: [
        { term: "Determinism", def: "All behavior has identifiable environmental and genetic causes; free will is rejected." },
        { term: "Parsimony", def: "Accept the simplest scientifically adequate explanation before invoking complex ones." },
        { term: "Philosophic doubt", def: "Ongoing willingness to revise conclusions when new evidence conflicts with current views." },
        { term: "Empiricism", def: "Knowledge must be grounded in systematic, objective observation, not tradition or authority." }
      ],
      quickCheck: {
        prompt: "A new study contradicts a finding you've used in practice for 5 years. Which philosophical assumption tells you how to respond, and what does it require?",
        answer: "Philosophic doubt — the willingness to continually revise conclusions when new evidence conflicts. It requires you to take the new data seriously, evaluate the methodology, and update practice if the evidence is sound, even when it's uncomfortable.",
        hint: "It's not about rejecting old findings outright — it's about your stance toward your own knowledge."
      },
      categorize: {
        title: "Match each statement to the philosophical assumption it best illustrates.",
        categories: [
          { id: 'determinism',  label: 'Determinism',     color: '#2563eb' },
          { id: 'parsimony',    label: 'Parsimony',       color: '#16a34a' },
          { id: 'doubt',        label: 'Philosophic Doubt',color: '#7c3aed' },
          { id: 'empiricism',   label: 'Empiricism',      color: '#dc2626' },
        ],
        items: [
          {
            text: "Before concluding the child has 'low motivation,' the BCBA collects ABC data to identify environmental triggers and consequences.",
            correct: 'parsimony',
            explanation: "Parsimony: rule out the simpler environmental explanation before invoking an internal trait.",
          },
          {
            text: "The clinician refuses to recommend essential oils as treatment because no peer-reviewed studies have demonstrated efficacy for this client population.",
            correct: 'empiricism',
            explanation: "Empiricism: knowledge claims must rest on systematic, objective observation — not tradition or anecdote.",
          },
          {
            text: "The supervisor accepts that her preferred prompting hierarchy may be wrong and reads two new studies that suggest a different approach.",
            correct: 'doubt',
            explanation: "Philosophic doubt: continual willingness to revise conclusions in light of new evidence.",
          },
          {
            text: "The behavior analyst assumes that even seemingly random aggression has identifiable antecedents and consequences if observation is precise enough.",
            correct: 'determinism',
            explanation: "Determinism: behavior has lawful, identifiable causes — there is no truly random or 'free' behavior.",
          },
          {
            text: "Rather than calling the student 'oppositional,' the team identifies that escape from non-preferred tasks reliably follows refusal.",
            correct: 'parsimony',
            explanation: "Parsimony: explain behavior by the most direct functional relationship, not a personality construct.",
          },
          {
            text: "When a long-standing intervention stops working, the team treats their previous understanding of the case as tentative and re-runs the FBA.",
            correct: 'doubt',
            explanation: "Philosophic doubt: previous conclusions are always provisional; reassess when data conflict.",
          },
        ],
      },
    },
    {
      // concept[2]: Radical Behaviorism and Private Events
      example: "Destiny, a 16-year-old with anxiety, tells her BCBA, Ms. Okafor, 'I feel dread before I have to speak in class and that is why I refuse.' Ms. Okafor does not dismiss the dread or treat it as a cause; instead, she treats it as behavior that also has an environmental history — likely a history of aversive outcomes in social-performance contexts. She targets the public verbal refusal directly while acknowledging that the private feeling is real, follows the same principles as public behavior, and will likely diminish as the social contingencies change.",
      keyTerms: [
        { term: "Private events", def: "Thoughts, feelings, and physiological states treated as behaviors, not mentalistic causes." },
        { term: "Methodological behaviorism", def: "Earlier view that dismissed private events entirely as outside scientific study." },
        { term: "Mentalistic explanation", def: "Explaining behavior by hypothetical internal constructs like 'will' or 'trait' — rejected in radical behaviorism." },
        { term: "Radical behaviorism", def: "Skinner's framework accepting private events as behavior subject to the same environmental principles." }
      ],
      quickCheck: {
        prompt: "How does radical behaviorism handle a client's report of 'feeling angry' — and how does this differ from a mentalistic account?",
        answer: "Radical behaviorism treats 'feeling angry' as a private behavior — real, but caused by environmental and biological history, not a free-floating internal state that 'causes' aggression. A mentalistic account would treat anger as the cause of behavior. Radical behaviorism asks: what environmental contingencies generate both the private feeling and the public response?",
        hint: "Think about whether anger is treated as a CAUSE or as another BEHAVIOR to explain."
      }
    },
    {
      // concept[3]: The Seven Dimensions of ABA (Baer, Wolf, and Risley, 1968)
      example: "A BCBA, Mr. Alvarez, designs a social-skills program for Priya, an 11-year-old with ASD. His supervisor flags that the written protocol uses the vague phrase 'prompt as needed' — violating the technological dimension because another clinician could not replicate it. Mr. Alvarez rewrites the protocol specifying exact prompt types, timing, and fading criteria, which also satisfies the conceptually systematic dimension by grounding every step in stimulus control transfer principles rather than intuition.",
      keyTerms: [
        { term: "Technological", def: "Procedures described completely enough for independent replication by another practitioner." },
        { term: "Conceptually systematic", def: "Procedures explained by and derived from established behavioral principles." },
        { term: "Generality", def: "Behavior change persists across time, settings, people, and untrained behaviors." },
        { term: "Applied", def: "Targets behaviors of genuine social significance to the individual and community." }
      ],
      quickCheck: {
        prompt: "A protocol says: 'Use whatever prompt the client needs to be successful.' Which TWO of the seven dimensions does this violate, and why?",
        answer: "It violates TECHNOLOGICAL (procedures must be described precisely enough for another practitioner to replicate — 'whatever prompt' isn't replicable) and CONCEPTUALLY SYSTEMATIC (it doesn't ground prompt selection in established stimulus-control principles like prompt fading or least-to-most hierarchy).",
        hint: "Both have to do with HOW the procedure is documented and justified."
      },
      categorize: {
        title: "Sort each procedural detail by which of the seven dimensions of ABA it best demonstrates.",
        categories: [
          { id: 'applied',          label: 'Applied',         color: '#dc2626' },
          { id: 'behavioral',       label: 'Behavioral',      color: '#2563eb' },
          { id: 'technological',    label: 'Technological',   color: '#16a34a' },
          { id: 'concept-systematic', label: 'Conceptually Systematic', color: '#7c3aed' },
          { id: 'effective',        label: 'Effective',       color: '#ea580c' },
          { id: 'generality',       label: 'Generality',      color: '#0891b2' },
        ],
        items: [
          {
            text: "Targeting tantrums in the cafeteria because they keep the student from eating with peers — a meaningful, socially significant problem.",
            correct: 'applied',
            explanation: "Applied: the target must matter to the individual and the community, not just be researchable.",
          },
          {
            text: "The protocol specifies 'deliver verbal praise within 2 seconds of compliance' rather than 'reinforce after compliance.'",
            correct: 'technological',
            explanation: "Technological: another practitioner could read it and execute it identically.",
          },
          {
            text: "After the child masters tooth brushing in clinic, the program tests whether it generalizes to home with parents.",
            correct: 'generality',
            explanation: "Generality: change persists across time, settings, people, and untrained behaviors.",
          },
          {
            text: "Frequency of tantrums is measured directly — not 'frustration' or 'mood,' which can't be observed.",
            correct: 'behavioral',
            explanation: "Behavioral: targets must be precisely measurable behaviors, not constructs.",
          },
          {
            text: "The intervention is grounded in differential reinforcement of alternative behavior (DRA) and stimulus control transfer principles.",
            correct: 'concept-systematic',
            explanation: "Conceptually systematic: derived from established behavioral principles, not intuition.",
          },
          {
            text: "The plan is judged successful only after data show a clinically significant 75% reduction in self-injury.",
            correct: 'effective',
            explanation: "Effective: behavior change must be of practical, not just statistical, significance.",
          },
        ],
      },
    }
  ],

  "Concepts and Principles": [
    {
      // concept[0]: Motivating Operations vs. Discriminative Stimuli
      example: "Tomas, a 6-year-old with ASD, cries and grabs for food throughout the school day — but his BCBA, Ms. Park, notices the behavior is dramatically worse on days when Tomas skips breakfast. The food deprivation is functioning as an establishing operation: it increases the value of food and makes food-seeking behavior more frequent, even in settings where no food is visible. When Ms. Park ensures Tomas eats breakfast and provides a scheduled snack, the same cafeteria environment (still an SD for food) no longer evokes grabbing because the MO has been abolished.",
      keyTerms: [
        { term: "Establishing operation (EO)", def: "MO that increases the current value of a reinforcer and evokes related behavior." },
        { term: "Abolishing operation (AO)", def: "MO that decreases the current value of a reinforcer and abates related behavior." },
        { term: "Discriminative stimulus (SD)", def: "Antecedent signaling reinforcement availability; does NOT alter reinforcer value." },
        { term: "Value-altering effect", def: "MO property of changing how reinforcing a consequence currently is." }
      ],
      quickCheck: {
        prompt: "A child has just finished a large meal and now ignores the snack drawer he usually opens immediately upon entering the kitchen. The kitchen itself hasn't changed. What's the simplest behavioral explanation?",
        answer: "An abolishing operation (AO) is in effect. Satiation has reduced the current value of food as a reinforcer. The kitchen is still the SD signaling food is available, but the SD doesn't change reinforcer VALUE — only MOs do that. Once the AO dissipates, the same SD will evoke the behavior again.",
        hint: "Both SDs and MOs influence behavior, but only one of them changes how 'wanted' the reinforcer is right now."
      },
      categorize: {
        title: "Sort each scenario by what's primarily at work — an MO or an SD.",
        categories: [
          { id: 'mo-eo', label: 'MO — EO', short: 'EO', color: '#dc2626' },
          { id: 'mo-ao', label: 'MO — AO', short: 'AO', color: '#16a34a' },
          { id: 'sd',    label: 'SD (signal, not value)', short: 'SD', color: '#2563eb' },
        ],
        items: [
          {
            text: "After a 12-hour shift with no food, the smell of pizza now evokes intense food-seeking behavior.",
            correct: 'mo-eo',
            explanation: "Deprivation increases the current value of food (and behaviors that produce it) — classic EO.",
          },
          {
            text: "The vending machine has had a 'broken' sign all morning. Students now walk past it without trying.",
            correct: 'sd',
            explanation: "The 'broken' sign is an S-delta — it signals reinforcement is unavailable. SDs/S-deltas don't change reinforcer value, they change response rates based on history of availability.",
          },
          {
            text: "After taking ibuprofen for a headache, the client no longer asks to leave the noisy classroom.",
            correct: 'mo-ao',
            explanation: "Pain reduction is an AO for escape from noise — the value of escape is decreased, so escape-maintained requests drop.",
          },
          {
            text: "When the BCBA enters the room, mands for tangibles increase sharply because she has historically delivered them.",
            correct: 'sd',
            explanation: "BCBA-present is an SD signaling tangibles are available. Her presence doesn't change how much the client wants the toy — it signals access.",
          },
          {
            text: "A new medication causes nausea, and the client refuses preferred snacks she normally requests.",
            correct: 'mo-ao',
            explanation: "Nausea reduces current value of food — abolishing operation for food-related behavior.",
          },
          {
            text: "The client's therapist is on vacation; with the substitute, the client emits far fewer mands for breaks.",
            correct: 'sd',
            explanation: "The familiar therapist is an SD with a strong history; the substitute is an S-delta or weaker SD for break-mands. Reinforcer value (escape) hasn't changed.",
          },
        ],
      },
    },
    {
      // concept[1]: Reinforcement Schedules and Their Behavioral Characteristics
      visual: "schedule_graph",
      animatedVisual: "schedule_compare",
      example: "Kezia, a 14-year-old, earns tokens for completing math problems. On a fixed-ratio 5 schedule (FR5), her BCBA, Dr. Webb, notices she blazes through sets of five problems then stops and stares out the window — the textbook post-reinforcement pause. When Dr. Webb switches to a variable-ratio schedule averaging 5 (VR5), Kezia works at a steady, rapid clip throughout the session with almost no pausing, because she cannot predict exactly which response will produce the token.",
      quickCheck: {
        prompt: "A client responds slowly right after each reinforcer is delivered, then accelerates rapidly as the next reinforcement time approaches. Which schedule is this and why does the pattern look this way?",
        answer: "Fixed-Interval (FI). Under FI, the first response after a fixed time produces reinforcement. Right after a reinforcer the client \"knows\" the next one is far off, so responding is low; as the interval-end approaches, responding accelerates — the classic 'FI scallop.' VI schedules produce steady moderate responding with no scallop because the time-to-reinforcement is unpredictable.",
        hint: "The pause-then-acceleration pattern only happens when the time-to-reinforcement is predictable."
      },
      keyTerms: [
        { term: "Post-reinforcement pause", def: "Temporary cessation of responding immediately after reinforcement on ratio schedules." },
        { term: "Scalloped pattern", def: "FI response pattern: slow start after reinforcement, acceleration as interval end nears." },
        { term: "Variable ratio (VR)", def: "Schedule reinforcing after an unpredictable number of responses; produces highest, steadiest rates." },
        { term: "Resistance to extinction", def: "How long behavior persists after reinforcement stops; highest on variable schedules." }
      ]
    },
    {
      // concept[2]: Automatic Reinforcement: Identification, Treatment, and Common Misconceptions
      visual: "fa_chart",
      example: "During a standard functional analysis for Isaiah, a 10-year-old, Dr. Lim observes that his repetitive head-rocking occurs at nearly identical high rates in the attention, demand, tangible, AND alone conditions. Social extinction — simply ignoring the behavior — has already been tried at home with no effect. Dr. Lim identifies this as automatic reinforcement and instead conducts a competing stimulation assessment, finding that a vibrating neck pillow dramatically reduces rocking by providing a matching sensory consequence noncontingently.",
      keyTerms: [
        { term: "Automatic reinforcement", def: "Reinforcement produced by the behavior itself, independent of any other person." },
        { term: "Matched stimulation", def: "NCR intervention providing a stimulus that matches the sensory consequence of the behavior." },
        { term: "Alone condition", def: "FA condition testing automatic reinforcement; no social stimuli or programmed consequences present." },
        { term: "Social extinction", def: "Withholding social attention; ineffective for automatically maintained behavior." }
      ],
      quickCheck: {
        prompt: "An FA shows undifferentiated high rates across attention, demand, tangible, AND alone conditions. The team plans to use planned ignoring as the intervention. What's wrong with this plan?",
        answer: "Planned ignoring (social extinction) only works for SOCIALLY-mediated behavior. Equal rates across all conditions — including alone — indicate AUTOMATIC reinforcement: the behavior produces its own reinforcing consequence (sensory, internal). Social extinction is mismatched and won't reduce the behavior. Better: noncontingent matched stimulation, response interruption, or differential reinforcement of incompatible alternatives.",
        hint: "Look at the ALONE condition — what does high responding there tell you about who's maintaining the behavior?"
      }
    },
    {
      // concept[3]: Extinction: Mechanisms, Bursts, and Clinical Management
      visual: "extinction_graph",
      animatedVisual: "extinction_burst",
      example: "Nadia, a 5-year-old, has been crying at bedtime to gain parental attention. Her parents, coached by BCBA Ms. Torres, begin planned ignoring (extinction for attention-maintained crying). On night three, Nadia cries for 45 uninterrupted minutes at twice her usual volume — an extinction burst. Ms. Torres prepares the family for this in advance, emphasizing that the burst does not mean the intervention is failing. By night seven, crying drops to under two minutes, and Ms. Torres labels a brief return of loud crying on night ten a spontaneous recovery, not a relapse.",
      keyTerms: [
        { term: "Extinction burst", def: "Temporary increase in response rate, intensity, or variability at the start of extinction." },
        { term: "Spontaneous recovery", def: "Brief return of extinguished behavior after a period of no responding; not treatment failure." },
        { term: "Function-specific extinction", def: "Extinction must match the maintaining function; mismatched extinction is ineffective or harmful." },
        { term: "Resurgence", def: "Return of a previously extinguished behavior when a more recent behavior is placed on extinction." }
      ],
      quickCheck: {
        prompt: "A family started extinction for attention-maintained tantrums two weeks ago. Tantrums had decreased to near zero, then yesterday — apparently out of nowhere — there was a 20-minute tantrum. Should the BCBA conclude the intervention failed?",
        answer: "No. This is most likely SPONTANEOUS RECOVERY — a brief return of the extinguished behavior after a period of no responding. It does NOT mean treatment failed. The team should continue extinction (no attention contingent on tantrums) and the recovery typically dissipates within a session or two. Stopping or modifying the procedure now would intermittently reinforce the resurgent response and make extinction much harder.",
        hint: "There are predictable extinction phenomena beyond the burst — what does ABA call brief returns of behavior after a period of suppression?"
      }
    }
  ],

  "Measurement, Data Display, and Interpretation": [
    {
      // concept[0]: Continuous vs. Discontinuous Measurement
      example: "Dr. Santos is measuring Elijah's hand-biting, which occurs in brief half-second bursts dozens of times per hour. A colleague suggests partial interval recording with 10-second intervals for ease of data collection. Dr. Santos rejects this because partial interval recording will systematically overestimate the behavior — recording an entire 10-second interval as 'occurred' for a half-second bite. Instead, she uses event recording with a tally counter, capturing each discrete instance accurately and enabling true rate calculation.",
      keyTerms: [
        { term: "Partial interval recording", def: "Scores interval if behavior occurs at any point; systematically overestimates occurrence." },
        { term: "Whole interval recording", def: "Scores interval only if behavior lasts the entire interval; systematically underestimates." },
        { term: "Momentary time sampling", def: "Records whether behavior is occurring at the exact moment the interval ends; least biased." },
        { term: "Inter-response time (IRT)", def: "Elapsed time between the end of one response and the start of the next." }
      ],
      quickCheck: {
        prompt: "You need to measure on-task behavior for a student over a 30-min seatwork block. The behavior occurs continuously when it occurs. Which discontinuous method is the LEAST appropriate, and which is the MOST appropriate, and why?",
        answer: "Partial interval is LEAST appropriate — it overestimates and any tiny burst of on-task behavior counts the whole interval. For continuous-state behavior you want either WHOLE INTERVAL (good for sustained engagement; underestimates conservatively) or MOMENTARY TIME SAMPLING (least biased; samples behavior at scheduled moments). MTS is generally preferred for continuous-state behaviors because it's least biased.",
        hint: "Match the bias to the behavior. Continuous behaviors are different from brief discrete ones."
      },
      categorize: {
        title: "Sort each measurement procedure by its directional bias.",
        categories: [
          { id: 'over',  label: 'Overestimates true occurrence', short: 'Over+', color: '#dc2626' },
          { id: 'under', label: 'Underestimates true occurrence', short: 'Under−', color: '#2563eb' },
          { id: 'least', label: 'Least biased / unbiased', short: 'Neutral', color: '#16a34a' },
        ],
        items: [
          { text: "Partial interval recording (10-sec intervals)", correct: 'over', explanation: "Any tiny occurrence within the interval scores the entire interval as positive — biases up." },
          { text: "Whole interval recording (10-sec intervals)", correct: 'under', explanation: "Behavior must persist the ENTIRE interval to score — short or interrupted occurrences score zero, biasing down." },
          { text: "Momentary time sampling (every 30 sec)", correct: 'least', explanation: "Snapshot at the cue moment — directional bias is minimal, especially for continuous-state behavior." },
          { text: "Frequency / event recording", correct: 'least', explanation: "Counts each occurrence directly — no time-based bias as long as the behavior has clear onset/offset." },
          { text: "Partial interval recording (60-sec intervals)", correct: 'over', explanation: "Larger intervals magnify the overestimation problem — even rare behaviors score nearly every interval." },
          { text: "Permanent product recording (e.g., problems completed)", correct: 'least', explanation: "Counts the actual product of behavior; no time-based bias." },
        ],
      },
    },
    {
      // concept[1]: Interobserver Agreement: Calculation, Adequacy, and Limitations
      example: "Two observers collect data on Cooper, a 12-year-old, using partial interval recording for stereotypy. They reach 91% IOA — which seems excellent. But BCBA Dr. Osei notices that both observers are reliably scoring nearly every interval as 'occurred,' regardless of actual behavior, because the 30-second intervals are too long. The high IOA reflects consistent over-measurement, not valid measurement. He switches both observers to event recording, and their IOA drops to 72% initially, revealing genuine disagreement about what counts as stereotypy — the real problem to solve.",
      keyTerms: [
        { term: "Smaller/larger IOA", def: "For count data: (smaller count divided by larger count) multiplied by 100; standard for frequency measures." },
        { term: "Interval-by-interval IOA", def: "Agreements divided by agreements plus disagreements, times 100; more sensitive than total count." },
        { term: "Reliability vs. validity", def: "High IOA means observers agree; it does NOT mean they are measuring the right thing." },
        { term: "Observer drift", def: "Gradual, unintentional shift in how observers apply the behavioral definition over time." }
      ],
      quickCheck: {
        prompt: "Two RBTs achieve 96% IOA on aggression frequency. The BCBA later reviews video and finds both observers are mislabeling intense gestures as 'aggression.' What does the high IOA tell you, and what does it NOT tell you?",
        answer: "High IOA tells you the observers AGREE with each other — that's reliability. It does NOT tell you they are measuring the right thing — that's validity. They could be reliably mismeasuring. To check validity you need a clear, well-trained operational definition checked against criterion observers (gold-standard data).",
        hint: "Reliability and validity are different. One is about agreement; the other is about accuracy."
      }
    },
    {
      // concept[2]: Visual Analysis of Single-Subject Data
      example: "BCBA Ms. Huang is reviewing graphs for Amara, a 6-year-old, whose tantrum frequency during baseline shows a strong downward trend before intervention even begins. A less experienced colleague interprets the continued decrease in the intervention phase as proof of treatment effectiveness. Ms. Huang explains that the baseline trend is a confound: if behavior was already improving, any further decrease during intervention cannot be attributed to the treatment alone — internal validity is compromised and the design should have delayed intervention until the baseline stabilized.",
      keyTerms: [
        { term: "Level", def: "Mean height of data points within a phase; assessed visually or as a median split." },
        { term: "Trend", def: "Direction and slope of the data path within a phase; can be increasing, decreasing, or flat." },
        { term: "Variability", def: "Scatter of data points around the trend line; high variability complicates interpretation." },
        { term: "Data overlap", def: "Data points from one phase falling within the range of adjacent-phase data; reduces confidence." }
      ],
      quickCheck: {
        prompt: "A baseline shows aggression decreasing across 6 sessions before intervention starts. The BCBA introduces the BIP and aggression continues to decrease. Why is it premature to declare the intervention effective?",
        answer: "The baseline already shows a DESCENDING TREND. Internal validity is compromised: the continued decrease during intervention may simply be the same trend continuing for reasons other than the BIP. Best practice is to delay introducing the IV until the baseline is stable or trending in the OPPOSITE direction from the predicted effect.",
        hint: "Visual analysis isn't just about the intervention phase — what was already happening before?"
      }
    },
    {
      // concept[3]: Treatment Integrity and Social Validity
      example: "A token economy for Devon, an 8-year-old, shows 35% improvement in on-task behavior. His BCBA, Mr. Reyes, is ready to declare it effective — but treatment integrity monitoring shows teachers delivered tokens on only 55% of planned opportunities. Mr. Reyes cannot conclude the token economy is effective; he can only conclude that partial implementation is associated with partial improvement. He runs staff training to bring fidelity above 90% before drawing any conclusions about the procedure's true effectiveness.",
      keyTerms: [
        { term: "Treatment integrity", def: "Degree to which an intervention is implemented exactly as designed and specified." },
        { term: "Social validity", def: "Acceptability and meaningfulness of goals, procedures, and outcomes to clients and stakeholders." },
        { term: "Procedural fidelity", def: "Synonym for treatment integrity; often measured as percentage of steps implemented correctly." },
        { term: "Wolf (1978)", def: "Author who introduced social validity to ABA; described significance of goals, procedures, and outcomes." }
      ],
      quickCheck: {
        prompt: "An intervention shows a 40% reduction in challenging behavior, but families report the procedures are 'too hard to do at home' and they've largely stopped using them. What ABA dimension does this fail, and what's the consequence?",
        answer: "It fails SOCIAL VALIDITY (specifically, acceptability of the procedures to stakeholders). Even effective procedures collapse without stakeholder buy-in — long-term outcomes depend on continued implementation. The BCBA should redesign for usability: shorter sessions, fewer materials, embedded routines.",
        hint: "Effectiveness data isn't enough — Wolf (1978) added another dimension that asks: do real people accept this?"
      }
    }
  ],

  "Experimental Design": [
    {
      // concept[0]: Internal Validity Threats in Single-Subject Designs
      visual: "abab_design",
      example: "BCBA Dr. Nguyen is running an ABAB design for Lily, a 10-year-old, targeting classroom aggression. Just as the second baseline phase begins, Lily's teacher retires and is replaced by a much calmer substitute. Lily's aggression drops dramatically — but Dr. Nguyen recognizes this as a history threat: a discrete external event (teacher change) occurred simultaneously with the phase change, making it impossible to attribute the decrease solely to withdrawal of the intervention. She documents the confound and extends the design to collect more data.",
      keyTerms: [
        { term: "History threat", def: "External event coinciding with a phase change that could independently explain behavior change." },
        { term: "Maturation threat", def: "Gradual developmental or biological change over time that could mimic intervention effects." },
        { term: "Internal validity", def: "Confidence that the independent variable, not extraneous factors, caused behavior change." },
        { term: "Instrumentation", def: "Validity threat from changes in measurement tools, observer criteria, or data systems over time." }
      ],
      quickCheck: {
        prompt: "Halfway through a 6-month BIP, two new RBTs are trained and begin running sessions. Behavior change accelerates. Which internal validity threat does this introduce, and how should it be handled?",
        answer: "INSTRUMENTATION — the measurement system effectively changed (different observers, possibly different operational criteria). To handle: re-establish IOA between old and new RBTs before drawing conclusions, mark the staff change on the graph as a phase event, and verify the operational definition is being applied identically.",
        hint: "Whenever the people doing the measuring change, what threat is automatically activated?"
      },
      categorize: {
        title: "Match each scenario to the internal-validity threat it represents.",
        categories: [
          { id: 'history',       label: 'History',         color: '#dc2626' },
          { id: 'maturation',    label: 'Maturation',      color: '#16a34a' },
          { id: 'instrumentation', label: 'Instrumentation', short: 'Instr', color: '#2563eb' },
          { id: 'testing',       label: 'Testing / Practice', short: 'Test', color: '#7c3aed' },
        ],
        items: [
          { text: "Mid-intervention, the family moves to a quieter neighborhood and aggression drops sharply.", correct: 'history', explanation: "A discrete external event (move) co-occurred with the phase — could independently explain the change." },
          { text: "Across 4 months of language intervention with a 3-year-old, vocabulary doubles.", correct: 'maturation', explanation: "Typical developmental change over 4 months in a 3-year-old can mimic intervention effect." },
          { text: "Halfway through baseline the BCBA changes the operational definition of 'tantrum' to include whining.", correct: 'instrumentation', explanation: "Changing the measurement criteria mid-study artificially shifts data — instrumentation threat." },
          { text: "Repeated administration of the same preference assessment causes the client to become familiar with all items.", correct: 'testing', explanation: "Testing/practice effect — repeated exposure changes performance independent of any intervention." },
          { text: "A new behavioral data app replaces paper tally sheets at the start of phase B.", correct: 'instrumentation', explanation: "Measurement tool changed at the same time as the intervention — confound." },
          { text: "During a 9-month stuttering intervention, a teen's voice changes and reading aloud becomes easier.", correct: 'maturation', explanation: "Biological change during adolescence could explain reading fluency improvement independent of intervention." },
        ],
      },
    },
    {
      // concept[1]: Reversal (ABAB) Design: Logic, Strengths, and Ethical Limits
      example: "Dr. Patel is using an ABAB design with Rowan, a 7-year-old, targeting stereotypic hand-flapping maintained by automatic reinforcement. In A2 (second baseline, treatment withdrawn), hand-flapping fails to return to baseline levels — the behavior does not reverse. This tells Dr. Patel the reversal design was a poor choice here: either the behavior has become irreversible due to behavioral history, or a variable outside his intervention is maintaining the lower rates. He switches to a multiple-baseline design for future skill-acquisition targets to avoid this limitation.",
      keyTerms: [
        { term: "Experimental control", def: "Demonstrated when behavior changes reliably and repeatedly with the independent variable." },
        { term: "Irreversible behavior", def: "Learned skill unlikely to return to baseline once acquired; reversal designs are inappropriate." },
        { term: "Replication of effect", def: "Behavior change occurring across both B phases strengthens causal inference in ABAB." },
        { term: "A2 phase", def: "Second baseline — treatment withdrawal; behavior should return toward baseline to demonstrate control." }
      ],
      quickCheck: {
        prompt: "You're using ABAB to evaluate a procedure that taught the client to request breaks. In A2, the client keeps requesting breaks at the same high rate. Does this disprove your intervention?",
        answer: "No — and it actually shows why ABAB was the wrong design here. Skill acquisition (a NEW behavior the client has learned) is typically IRREVERSIBLE: you can't 'unlearn' a skill by withdrawing the intervention. The continued high requesting in A2 doesn't disprove effectiveness; it shows the design can't distinguish learning from intervention effect. A multiple baseline across behaviors or participants would have been better suited.",
        hint: "Reversal designs require the behavior to be able to RETURN to baseline. What kinds of behaviors don't?"
      }
    },
    {
      // concept[2]: Multiple Baseline Designs: Experimental Logic and Confounds
      visual: "multiple_baseline",
      example: "Ms. Flores, a BCBA, is teaching three daily-living skills to Caleb, a 13-year-old, using a multiple baseline across behaviors. She introduces instruction for tooth brushing first and monitors the untreated skills (hand washing and hair combing) in extended baseline. When she notices that hand washing also improves before she introduces instruction for it, she suspects co-variation — the behaviors may be functionally related, or Caleb's general compliance is increasing. She documents this as a confound threatening experimental control rather than reporting it as treatment generalization.",
      keyTerms: [
        { term: "Co-variation", def: "Untreated tiers change before intervention reaches them, threatening multiple baseline logic." },
        { term: "Staggered introduction", def: "Sequential application of the IV across tiers; the core logic of multiple baseline designs." },
        { term: "Tier", def: "Each separate behavior, setting, or participant strand in a multiple baseline design." },
        { term: "Concurrent baselines", def: "All tiers collected simultaneously before any intervention; required for valid comparison." }
      ],
      quickCheck: {
        prompt: "In a multiple baseline across THREE behaviors, the BCBA introduces the IV to behavior 1 and behavior 1 improves. Behavior 2, still in baseline, also improves. What does this tell you, and what should the BCBA do?",
        answer: "It tells you co-variation is occurring — the untreated tier is changing before the IV reaches it. Experimental control is threatened: you can't rule out a third variable causing the change. Options: (a) suspect the behaviors are functionally related and pick more independent tiers next time, (b) extend baselines further on the remaining tiers to see if change continues without IV, or (c) abandon the design and use a different one.",
        hint: "Independence of tiers is the central logic. When tiers move together without intervention, what happens to that logic?"
      }
    },
    {
      // concept[3]: Alternating Treatments Design: Comparison and Carryover
      example: "BCBA Dr. Kowalski wants to compare errorless learning versus trial-and-error teaching for Mia, a 5-year-old learning to identify shapes. He uses an ATD, rapidly alternating the two conditions across daily sessions with counterbalanced order. After 10 sessions the data paths clearly diverge — Mia's accuracy is consistently higher in the errorless learning condition. Because he counterbalanced condition order, Dr. Kowalski is confident the divergence reflects true differential effectiveness rather than carryover from one condition influencing performance in the other.",
      keyTerms: [
        { term: "Carryover effect", def: "Exposure to one condition alters responding in the immediately following condition." },
        { term: "Counterbalancing", def: "Varying the order of conditions across sessions to distribute carryover effects equally." },
        { term: "Divergence", def: "Visual separation of data paths in ATD indicating differential effectiveness of conditions." },
        { term: "Multielement design", def: "Alternative name for ATD; emphasizes rapid alternation of multiple independent conditions." }
      ],
      quickCheck: {
        prompt: "An ATD compares Procedure A and Procedure B in fixed order (A always before B in each session). After 12 sessions B looks more effective. What's the design flaw, and is the conclusion safe?",
        answer: "The flaw is no COUNTERBALANCING — exposure to A immediately before B every time means any carryover from A could be inflating or deflating B's apparent effect. The conclusion isn't safe. To fix: alternate the order randomly or counterbalance (ABBA, BAAB, etc.) so any carryover effects are distributed equally across conditions.",
        hint: "If one condition is always seen second, what could be carrying over?"
      }
    }
  ],

  "Ethical and Professional Issues": [
    {
      // concept[0]: BACB Ethics Code 2.0: Core Responsibilities and Multiple Relationships
      example: "BCBA Ms. Brennan has been working with a family for two years and is now invited to the client's birthday party. She considers Section 1.06: the relationship is warm but not a pre-existing personal friendship — the family views her as a trusted professional. She consults with a colleague, documents her reasoning, and determines that attending a brief birthday event poses low exploitation risk given the context. She attends for 20 minutes, maintains professional boundaries, and documents her decision rationale in the clinical record.",
      keyTerms: [
        { term: "Multiple relationship", def: "Existing in both a professional and personal or business relationship with the same person." },
        { term: "Exploitation", def: "Using a professional relationship for personal gain at the client's or supervisee's expense." },
        { term: "Ethics Code 2.0", def: "BACB code effective January 2022; organized by responsibility to clients, field, and colleagues." },
        { term: "Objectivity impairment", def: "Condition in which a personal relationship distorts professional judgment or decisions." }
      ],
      quickCheck: {
        prompt: "A client's parent invites you to a birthday dinner at their home — you've been their child's BCBA for 3 years. What's the framework for deciding whether to attend, and what specifically must you weigh?",
        answer: "There's no blanket prohibition on multiple relationships, but you weigh: (1) RISK OF EXPLOITATION — could the relationship be misused or harmful, (2) OBJECTIVITY IMPAIRMENT — could it distort your professional judgment, (3) the cultural and rural-context norms (in some communities, declining is itself harmful), and (4) consultation/documentation. If the risk profile is low and you document your reasoning, attendance can be appropriate. The Ethics Code asks for a thoughtful weighing, not a reflex avoidance.",
        hint: "The Code doesn't ban dual relationships — it asks you to think about specific risks."
      }
    },
    {
      // concept[1]: Informed Consent: What It Requires and When It Is Not Sufficient
      example: "Parents of Sofia, a 4-year-old with ASD, sign consent for a punishment-based procedure after reviewing written materials. BCBA Dr. Oguike realizes less restrictive alternatives — DRA and FCT — have not been tried and are likely to produce similar results. Even though consent was freely given, he declines to implement the punishment procedure without first documenting that less restrictive alternatives were considered and found insufficient, because informed consent does not override his ethical obligation to pursue least restrictive treatment first.",
      keyTerms: [
        { term: "Informed consent", def: "Voluntary, knowledgeable agreement by a competent person after receiving complete information." },
        { term: "Capacity to consent", def: "Client's ability to understand information and make voluntary decisions; may require a surrogate." },
        { term: "Assent", def: "Client's affirmative agreement to participate, distinct from legal consent by a guardian." },
        { term: "Coercion", def: "Pressure that undermines voluntariness of consent; invalidates the consent process." }
      ],
      quickCheck: {
        prompt: "Parents sign consent for a restrictive procedure. The client (a verbal teen with capacity) says 'I don't want to do that.' What does ethics require, and is the parental consent sufficient?",
        answer: "Parental consent is the LEGAL consent needed for a minor, but ASSENT — the client's own affirmative agreement to participate — is also ethically required when the client has the capacity to assent. Lack of assent is a STOP signal. The team should explore the client's concerns, consider less restrictive alternatives, and document the dissent. Proceeding without assent (especially for restrictive procedures) is an ethics red flag even when legal consent exists.",
        hint: "Two terms — one is legal, one is ethical. They serve different purposes."
      },
      categorize: {
        title: "Sort each scenario into informed-consent terminology.",
        categories: [
          { id: 'consent',  label: 'Valid Informed Consent', short: 'OK', color: '#16a34a' },
          { id: 'capacity', label: 'Capacity Concern',       short: 'Cap', color: '#7c3aed' },
          { id: 'coercion', label: 'Coercion / Invalid',     short: '⚠', color: '#dc2626' },
          { id: 'assent',   label: 'Assent Issue',           short: 'Asn', color: '#2563eb' },
        ],
        items: [
          { text: "Adult client with intact capacity reads, understands, and signs the consent form voluntarily after the BCBA reviews risks and alternatives.", correct: 'consent', explanation: "All elements present: voluntary + knowledgeable + competent + complete information." },
          { text: "BCBA tells the family 'services will be terminated unless you sign this consent right now.'", correct: 'coercion', explanation: "Threat of service termination undermines voluntariness — invalid consent regardless of signature." },
          { text: "Adult client with severe intellectual disability is asked to sign her own consent without surrogate involvement.", correct: 'capacity', explanation: "Capacity may be limited; needs assessment of capacity and likely a legally authorized representative." },
          { text: "Guardian signs consent; the verbal 12-year-old client refuses to participate in the procedure.", correct: 'assent', explanation: "Assent (the client's own agreement) is missing; ethical practice requires addressing dissent even when legal consent is in place." },
          { text: "Parents are given written consent in their primary language with a 48-hour window to ask questions before signing.", correct: 'consent', explanation: "Voluntary + adequate time + understandable information — strong consent process." },
          { text: "RBT pressures supervisee to consent to recordings being shared at conferences in exchange for letter of recommendation.", correct: 'coercion', explanation: "Conditional benefits tied to consent = coercion; invalidates the process." },
        ],
      },
    },
    {
      // concept[2]: Addressing Ethical Violations by Colleagues: Graduated Response
      example: "At a team meeting, BCBA Mr. Kim notices that his colleague is routinely implementing a restrictive procedure without documented parental consent. He addresses it privately in a one-on-one conversation — the colleague claims parents verbally agreed but has no documentation. Mr. Kim asks her to obtain written consent immediately and offers to help with the form. She complies within 24 hours. Because the issue was resolved informally and the client was not harmed, Mr. Kim does not escalate to the BACB, but documents his concern and its resolution in his own records.",
      keyTerms: [
        { term: "Graduated response", def: "Ethics Code approach: informal first, then formal channels, then regulatory reporting." },
        { term: "Informal resolution", def: "Directly addressing a concern with a colleague before involving supervisors or regulators." },
        { term: "BACB reporting", def: "Filing a formal complaint with the BACB; reserved for serious harm, fraud, or unresolved violations." },
        { term: "Documentation", def: "Written record of ethical concerns, actions taken, and outcomes; protects all parties involved." }
      ],
      quickCheck: {
        prompt: "You discover a colleague is fabricating session data. Should you (a) confront them privately first, (b) skip straight to BACB reporting, or (c) escalate to your supervisor — and why?",
        answer: "Skip the informal step. Data fabrication is FRAUD with direct client harm and legal implications — graduated response doesn't apply. Report to your supervisor immediately AND file with the BACB; depending on jurisdiction, you may also have mandated reporting obligations. Informal-first is for minor or correctable issues, not for fraud.",
        hint: "Graduated response has limits. What's the boundary case where you skip the informal step?"
      }
    },
    {
      // concept[3]: Competence: Boundaries, Expansion, and Telehealth
      example: "BCBA Dr. Walsh has extensive experience with children but is asked to develop a behavior support plan for an adult with dementia in a memory care facility. Rather than declining or accepting without preparation, she discloses her competence boundary to the referral source, enrolls in a continuing education course on geriatric behavioral health, and arranges monthly consultation with a BCBA experienced in older adult populations. She begins services only after completing the training and securing consultation, documenting her competence-expansion process throughout.",
      keyTerms: [
        { term: "Scope of competence", def: "Boundaries of a BCBA's practice defined by education, training, and supervised experience." },
        { term: "Competence expansion", def: "Adding new population or technique competence via training, supervision, and consultation." },
        { term: "Telehealth competence", def: "Requires clinical, delivery-modality, and jurisdiction-specific regulatory knowledge." },
        { term: "Disclosure of limitations", def: "Ethical obligation to inform clients when referral or supervision is needed due to competence gaps." }
      ],
      quickCheck: {
        prompt: "A BCBA experienced with adolescents is asked to start serving toddlers via telehealth in a state where she's never practiced. What two competence boundaries are at stake, and what does ethical practice require?",
        answer: "Two boundaries: (1) POPULATION — new age group with different developmental norms and intervention approaches, (2) MODALITY + JURISDICTION — telehealth has its own clinical and regulatory requirements, and a new state means new licensure rules. Ethical practice requires competence expansion (training, supervision, consultation) BEFORE seeing clients, plus verifying state licensure/portability and telehealth-specific regulations. Disclosure to families is required if she's still building competence.",
        hint: "Multiple competence dimensions can shift at once — which ones changed for her?"
      }
    }
  ],

  "Behavior Assessment": [
    {
      // concept[0]: The Assessment Hierarchy: Indirect, Descriptive, and Experimental
      example: "Jared, a 9-year-old, is referred for aggressive behavior. His BCBA, Dr. Osei, begins with a parent interview (indirect) and generates a hypothesis that aggression is escape-maintained during homework. She then conducts ABC recording in the home (descriptive), finding that aggression consistently follows homework demands and is followed by removal of materials. Only after these methods converge on the same hypothesis does she propose a brief functional analysis to experimentally confirm the escape function before designing treatment.",
      keyTerms: [
        { term: "Indirect assessment", def: "Behavior information gathered via interviews or rating scales without direct observation." },
        { term: "Descriptive assessment", def: "Direct observation of behavior in natural contexts; identifies patterns but not functions." },
        { term: "Functional analysis (FA)", def: "Experimental manipulation of antecedents and consequences to identify maintaining variables." },
        { term: "Functional hypothesis", def: "Testable explanation of the variable maintaining a behavior, generated before FA confirmation." }
      ],
      quickCheck: {
        prompt: "Why is descriptive assessment (e.g., ABC recording) considered insufficient for confirming behavioral function, even when patterns look obvious?",
        answer: "Descriptive assessment shows CORRELATION between events and behavior — not causation. The same antecedent might consistently precede behavior because of an unmeasured third variable, and the same consequence might follow without actually maintaining the behavior. Only experimental manipulation (FA) can demonstrate that the suspected antecedent/consequence reliably and repeatedly produces the change.",
        hint: "Correlation isn't causation — what does FA add that ABC observation alone can't?"
      },
      categorize: {
        title: "Sort each assessment activity by where it falls in the assessment hierarchy.",
        categories: [
          { id: 'indirect',    label: 'Indirect',          color: '#7c3aed' },
          { id: 'descriptive', label: 'Descriptive',       color: '#2563eb' },
          { id: 'experimental',label: 'Experimental (FA)', short: 'FA', color: '#16a34a' },
        ],
        items: [
          { text: "BCBA conducts the FAST and the QABF rating scales with the parent.", correct: 'indirect', explanation: "Rating scales are indirect assessment — informant report, no observation." },
          { text: "RBT collects ABC data during 5 home sessions over two weeks.", correct: 'descriptive', explanation: "ABC recording is descriptive — direct observation of natural patterns, no manipulation." },
          { text: "Team alternates 10-min conditions: alone, attention, demand, control — and graphs SIB rate by condition.", correct: 'experimental', explanation: "Manipulating conditions to isolate function = functional analysis." },
          { text: "Teacher completes the Motivation Assessment Scale and emails it to the BCBA.", correct: 'indirect', explanation: "Informant rating scale; no direct or experimental observation." },
          { text: "BCBA video-records 3 typical school days and codes antecedent-behavior-consequence sequences.", correct: 'descriptive', explanation: "Recording natural patterns is descriptive — even systematic coding is correlational, not causal." },
          { text: "After hypothesis from interview + ABC, BCBA tests the escape function with a brief pairwise FA condition.", correct: 'experimental', explanation: "Even a brief test that manipulates the contingency is experimental." },
        ],
      },
    },
    {
      // concept[1]: Functional Analysis: Interpreting Ambiguous and Undifferentiated Results
      example: "BCBA Ms. Yee conducts a standard FA for Bianca, a 7-year-old, and sees elevated self-injury in every condition including control. Before concluding Bianca has multiple functions, Ms. Yee audits her protocol: the control condition contained only two toys Bianca had already habituated to, meaning it was not truly an enriched environment. She replaces the control toys, reruns the FA, and finds clear differentiation — self-injury elevates only in the demand condition, consistent with an escape function.",
      keyTerms: [
        { term: "Undifferentiated results", def: "FA pattern where behavior is elevated across all conditions; often reflects methodological issues." },
        { term: "Control condition", def: "FA condition with enriched environment and no programmed consequences; tests automatic function." },
        { term: "Attention condition", def: "FA condition testing social-positive reinforcement via brief contingent attention delivery." },
        { term: "Demand condition", def: "FA condition testing negative reinforcement via escape from presented tasks or demands." }
      ],
      quickCheck: {
        prompt: "An FA shows behavior elevated in attention, demand, AND alone — only the control condition is low. Before concluding 'multiple control,' what should you check?",
        answer: "Audit your CONTROL condition. Equal-but-elevated rates across multiple test conditions with low rates only in control often indicate the control isn't truly enriched (e.g., toys client has habituated to, attention level too sparse, residual demands). When control isn't actually controlling, every test condition can look elevated. Re-engineer control with high-preference items, free attention, and no demands; then rerun.",
        hint: "Before concluding the behavior is multiply controlled, ask: is the comparison condition actually doing its job?"
      }
    },
    {
      // concept[2]: Preference Assessments: Preference vs. Reinforcing Function
      example: "A paired-stimulus assessment identifies cars as Mateo's highest-preference item. His BCBA, Dr. Cruz, builds a teaching program using cars as the only reinforcer. After two weeks, Mateo's response rates decline. Dr. Cruz conducts a reinforcer assessment and discovers that cars are no longer functioning as reinforcers — Mateo has satiated on them because he plays with them freely at home for hours each day. She diversifies the reinforcer pool and implements a formal reinforcer assessment before each session, not just at program outset.",
      keyTerms: [
        { term: "Paired stimulus assessment", def: "Preference assessment presenting two items simultaneously; client selects one; yields ranked hierarchy." },
        { term: "Satiation", def: "Decreased reinforcing value of a stimulus due to recent, extensive access." },
        { term: "Reinforcer assessment", def: "Direct test of whether a preferred stimulus increases future behavior when delivered contingently." },
        { term: "Free operant observation", def: "Preference assessment tracking time spent with items in unrestricted, naturalistic access." }
      ],
      quickCheck: {
        prompt: "Why is a high-preference item from a paired-stimulus assessment NOT necessarily a reinforcer, and what's the next step before using it as one in a teaching program?",
        answer: "Preference predicts CHOICE, not reinforcing function. The item might fail as a reinforcer because of (a) easy access at home (satiation), (b) wrong context, or (c) it's preferred but doesn't actually increase the target behavior. Next step: a brief REINFORCER ASSESSMENT — deliver the item contingent on the target response in a controlled task and verify response rate increases. Only then is it a confirmed reinforcer for that behavior.",
        hint: "Liking and reinforcing are not the same thing. What's the test that verifies the second?"
      }
    },
    {
      // concept[3]: Social Validity Assessment: Goals, Procedures, and Outcomes
      example: "BCBA Ms. Kamara achieves a technically excellent outcome: Kenji, a 15-year-old, has reduced his public self-stimulatory behavior by 80% through a response interruption and redirection program. But a post-treatment social validity questionnaire reveals that Kenji finds the procedure humiliating and has started avoiding settings where staff are present. Ms. Kamara uses this data to redesign the intervention around self-management instead, recognizing that a client who avoids treatment settings has not truly benefited from the behavior change.",
      keyTerms: [
        { term: "Social significance", def: "Whether the targeted behavior goal matters meaningfully to the client and their community." },
        { term: "Normative comparison", def: "Social validity method comparing client's behavior to peers in the same setting." },
        { term: "Wolf (1978)", def: "Introduced social validity to ABA; emphasized three levels: goals, procedures, and outcomes." },
        { term: "Stakeholder", def: "Anyone affected by the intervention — client, caregivers, teachers, community members." }
      ],
      quickCheck: {
        prompt: "Wolf (1978) named three levels of social validity. Name them, and give one example question per level you'd ask a stakeholder.",
        answer: "GOALS: 'Is reducing this behavior really important for the client's life?' PROCEDURES: 'Are the methods we're using acceptable to you?' OUTCOMES: 'Is the change you're seeing meaningful in everyday life?' Each level can be assessed at different points (pre-treatment for goals, mid-treatment for procedures, post-treatment for outcomes).",
        hint: "Goals → Procedures → Outcomes. Each is a different question stakeholders should answer."
      }
    }
  ],

  "Behavior-Change Procedures": [
    {
      // concept[0]: Prompt Hierarchies and Fading: Preventing Prompt Dependency
      visual: "prompt_hierarchy",
      example: "Anaya, a 6-year-old, has learned to wash her hands only when her RBT physically guides her through each step (full physical prompt). Despite months of intervention, she never initiates independently. Her BCBA, Dr. Mendez, identifies prompt dependency: the physical prompt has become an SD for hand washing rather than the natural cues (dirty hands, entry into a bathroom). Dr. Mendez implements a progressive time delay — inserting a 3-second wait before delivering any prompt — which creates space for Anaya to initiate independently and receive denser reinforcement for unprompted responses.",
      keyTerms: [
        { term: "Prompt dependency", def: "Behavior occurring only in the presence of prompts rather than natural discriminative stimuli." },
        { term: "Most-to-least (MTL) prompting", def: "Begins with highest support and fades to less intrusive; errorless learning approach." },
        { term: "Least-to-most (LTM) prompting", def: "Begins with minimal support; escalates only if client does not respond within a time delay." },
        { term: "Progressive time delay", def: "Fading procedure inserting increasing wait intervals before prompt delivery to promote independence." }
      ],
      animatedVisual: "shaping_graph",
      quickCheck: {
        prompt: "A learner reliably hand-washes when the RBT physically guides each step but never initiates independently. The team has been doing full-physical prompting for 6 months. What's the diagnosis and what's a fix?",
        answer: "Prompt dependency — the prompt has become an SD for the response, replacing the natural cues. Fix: switch from a fixed prompt level to a fading procedure such as PROGRESSIVE TIME DELAY (insert a 3-sec wait before any prompt, increasing across sessions) or LEAST-TO-MOST prompting, paired with denser reinforcement for unprompted responses.",
        hint: "If the same prompt level has been delivered for months without independence, it's no longer a teaching aid — it's become the cue."
      }
    },
    {
      // concept[1]: Differential Reinforcement: DRO, DRI, DRA, and DRL
      example: "Keanu, a 10-year-old, screams for attention. His team debates whether to use DRO or FCT. His BCBA, Dr. Park, explains that DRO would reinforce any behavior other than screaming every 3 minutes — but Keanu still would have no way to get attention appropriately, so screaming is likely to return. She selects DRA using FCT, teaching Keanu to tap a communication card to request attention. The DRA addresses the function of screaming rather than simply suppressing it, making the behavior change more durable.",
      keyTerms: [
        { term: "DRO", def: "Reinforces the absence of the target behavior; function-agnostic and does not teach replacement skills." },
        { term: "DRI", def: "Reinforces behavior physically impossible to perform simultaneously with the target behavior." },
        { term: "DRA", def: "Reinforces a functionally equivalent alternative behavior; often used alongside FCT." },
        { term: "DRL", def: "Reinforces the target behavior only when its rate falls at or below a specified criterion." }
      ],
      quickCheck: {
        prompt: "A child screams for attention. Why is DRA (with FCT) generally preferred over DRO for this case?",
        answer: "DRO reinforces the ABSENCE of screaming for a fixed time, but doesn't teach any new way to access attention — so screaming usually returns once DRO ends. DRA + FCT teaches a functionally equivalent replacement (e.g., tapping a card, raising hand) that delivers the SAME reinforcer as screaming. Because the new behavior is reinforced by the same function, it's more durable and generalizes better. DRO is best reserved for behaviors with no clear replacement need (e.g., automatically reinforced behaviors).",
        hint: "Both reduce the target. Only one teaches a way to get the same reinforcer."
      },
      categorize: {
        title: "Sort each procedure into the correct DR variant.",
        categories: [
          { id: 'dro', label: 'DRO', color: '#16a34a' },
          { id: 'dri', label: 'DRI', color: '#2563eb' },
          { id: 'dra', label: 'DRA', color: '#7c3aed' },
          { id: 'drl', label: 'DRL', color: '#dc2626' },
        ],
        items: [
          { text: "Reinforce the client every 5 minutes that no aggression has occurred.", correct: 'dro', explanation: "Reinforcing the ABSENCE of the target = DRO." },
          { text: "Teach the client to raise her hand to ask for help instead of screaming for the teacher.", correct: 'dra', explanation: "Reinforcing a functionally equivalent alternative behavior = DRA." },
          { text: "Reinforce the client whenever he keeps both hands on the table (incompatible with hand-flapping).", correct: 'dri', explanation: "Hands-on-table physically prevents flapping = incompatible behavior reinforcement." },
          { text: "Reinforce the client only on days when he asks fewer than 8 questions per hour.", correct: 'drl', explanation: "Reinforcing the target behavior only when rate is BELOW criterion = DRL." },
          { text: "Provide a token every time the client uses her PECS card to request a break instead of throwing materials.", correct: 'dra', explanation: "Replacement behavior produces same reinforcer (escape) as the target = DRA / FCT." },
          { text: "Set a kitchen timer for 3 minutes; if no SIB occurs, deliver praise and a preferred snack.", correct: 'dro', explanation: "Time-based reinforcement contingent on absence of behavior = DRO." },
        ],
      },
    },
    {
      // concept[2]: Chaining: Forward, Backward, and Total Task
      example: "Marcus, a 13-year-old with intellectual disability, is learning to make a sandwich. His BCBA, Ms. Chen, uses backward chaining: Marcus is prompted through all steps except the last (placing the sandwich on the plate), which he performs independently and is immediately reinforced. Over weeks, the final independently performed step moves progressively earlier in the chain. Ms. Chen chooses backward chaining over forward chaining because Marcus experiences completing the full task every session, maintaining his motivation in a way that stopping mid-chain in forward chaining does not.",
      keyTerms: [
        { term: "Backward chaining", def: "Teaches last step first; client always completes the full chain and receives terminal reinforcement." },
        { term: "Forward chaining", def: "Teaches first step first; subsequent steps prompted until independence criteria are met sequentially." },
        { term: "Total task presentation", def: "Client attempts all steps every session with prompts provided as needed throughout the chain." },
        { term: "Task analysis", def: "Breaking a complex skill into discrete sequential steps; quality directly affects chaining outcomes." }
      ],
      quickCheck: {
        prompt: "A learner is highly motivated by completing tasks but tends to give up partway through new chains. Which chaining method is best matched to this learner profile, and why?",
        answer: "BACKWARD CHAINING. The learner experiences completing the full chain every session — the natural reinforcement of finishing the task happens immediately, every time. Forward chaining, by contrast, would require giving up partway (since later steps aren't yet trained), which works against the motivation profile.",
        hint: "Which method ensures the learner reaches the terminal reinforcer every single session?"
      }
    },
    {
      // concept[3]: Generalization Programming: Teaching for Transfer
      example: "Priya, a 7-year-old, can independently request a snack using her AAC device with Ms. Lewis but falls silent when any other adult is present. Her BCBA, Dr. Singh, identifies a stimulus generalization failure and implements multiple-exemplar training, systematically introducing requests across 10 different communication partners in three different settings over four weeks. He also programs natural maintaining contingencies by training cafeteria staff so that Priya's independent requests are reinforced in the real world, not just in therapy.",
      keyTerms: [
        { term: "Stimulus generalization", def: "Behavior occurring with stimuli similar to, but not identical to, the original training stimuli." },
        { term: "Multiple exemplar training", def: "Training across varied instances to broaden stimulus control and promote generalization." },
        { term: "Natural maintaining contingency", def: "Reinforcement available in the natural environment that sustains generalized behavior change." },
        { term: "Training loosely", def: "Varying non-essential features of training stimuli to broaden the generalization gradient." }
      ],
      quickCheck: {
        prompt: "A learner uses an AAC device to request snacks during therapy sessions but never spontaneously requests with parents at home. What's the diagnosis and what should the BCBA program?",
        answer: "STIMULUS GENERALIZATION FAILURE — the response is under tight stimulus control of the therapy context (specific therapist, specific room). Program: MULTIPLE EXEMPLAR TRAINING across people, settings, and times of day. Train communication partners (parents, siblings) to honor requests. Then program for NATURAL MAINTAINING CONTINGENCIES — make sure the response actually produces snacks at home, not just praise.",
        hint: "Generalization rarely happens by accident. What active programming gets the response into new contexts?"
      }
    }
  ],

  "Selecting and Implementing Interventions": [
    {
      // concept[0]: Least Restrictive Effective Treatment: Principle and Application
      example: "Tobias, a 12-year-old, engages in severe, tissue-damaging head-banging that has resulted in a skull fracture. His BCBA, Dr. Reyes, considers the least restrictive alternative principle but recognizes that the medical severity justifies implementing a more intensive intervention package immediately rather than starting with the most minimal approach and waiting to see if it works. She documents the clinical rationale, obtains appropriate consent, and includes a plan for fading to less intensive procedures as behavior improves — demonstrating that LRA guides the overall trajectory, not necessarily the first step.",
      keyTerms: [
        { term: "Least restrictive alternative (LRA)", def: "Ethical principle requiring the least intrusive, least aversive intervention likely to be effective." },
        { term: "Restrictiveness", def: "Degree to which an intervention limits a client's freedom, movement, or choice." },
        { term: "Aversive stimulus", def: "Stimulus whose removal strengthens behavior or whose presentation suppresses future responding." },
        { term: "Clinical rationale", def: "Documented justification for selecting a particular intervention level given the individual context." }
      ],
      quickCheck: {
        prompt: "Does the LRA principle mean you must always start with the most minimal intervention regardless of severity?",
        answer: "No. LRA guides the OVERALL TRAJECTORY toward the least restrictive effective option, but it does NOT require starting at the lowest level when clinical severity demands more intensive action (e.g., medically dangerous SIB, immediate safety risks). The expectation is to (a) document the clinical rationale for the starting intensity, (b) include a fading plan to less restrictive procedures as behavior improves, and (c) review and de-escalate when data support it.",
        hint: "Least restrictive doesn't mean least intervention — it means least restrictive that's still EFFECTIVE."
      }
    },
    {
      // concept[1]: Treatment Integrity Monitoring and Its Implications for Clinical Decisions
      example: "An FCT program for Gabrielle, a 9-year-old, shows no improvement after six weeks. Before abandoning FCT, her BCBA, Ms. Nakamura, pulls integrity data and finds that classroom aides are only honoring Gabrielle's communication card on 40% of opportunities — they frequently miss or delay the response. Ms. Nakamura concludes that FCT has not actually been tested at adequate fidelity. She runs a staff BST session, brings integrity to 92%, and observes a 60% reduction in problem behavior within two weeks — confirming the procedure was never the problem.",
      keyTerms: [
        { term: "Treatment integrity", def: "Percentage of intervention steps implemented correctly as specified in the written protocol." },
        { term: "Fidelity threshold", def: "Minimum acceptable integrity level (typically 80%+) before data can be attributed to the procedure." },
        { term: "Component analysis", def: "Identifying which specific elements of a multi-component package produce behavior change." },
        { term: "Implementation science", def: "Study of how to translate evidence-based practices into real-world clinical settings effectively." }
      ],
      quickCheck: {
        prompt: "After 6 weeks of FCT, the data show no improvement. The team wants to discontinue FCT. What MUST you check before agreeing the procedure has failed?",
        answer: "TREATMENT INTEGRITY data. If staff implementation fidelity is below threshold (typically <80%), the procedure has not actually been tested at the intended dose — the failure may be implementation, not procedure. Run integrity checks; if integrity is low, do BST with staff and re-evaluate. Only if integrity is high (>80%) AND no improvement should you change the procedure.",
        hint: "Before blaming the intervention, check whether it was actually run as designed."
      }
    },
    {
      // concept[2]: Function-Based Intervention Selection: Matching Procedure to Maintaining Variable
      example: "Dominique, a 15-year-old, disrupts class by making loud comments. A previous BCBA implemented planned ignoring (attention extinction). Disruptions got worse. The new BCBA, Dr. Harmon, reviews the functional assessment and discovers that disruptions are actually maintained by escape from difficult tasks — peers laughing at the teacher's reaction removes the task pressure. Ignoring teacher attention is completely mismatched to the escape function. Dr. Harmon implements demand fading and FCT for break requests, and disruptions drop by 70% within three weeks.",
      keyTerms: [
        { term: "Function-matched intervention", def: "Treatment whose mechanism directly targets the identified maintaining reinforcer." },
        { term: "Escape extinction", def: "Preventing escape from the demand contingent on problem behavior; for escape-maintained behavior." },
        { term: "FCT (functional communication training)", def: "Teaching a communication response that produces the same reinforcer as the problem behavior." },
        { term: "Function mismatch", def: "Applying a procedure targeting a different function than what actually maintains behavior; ineffective or harmful." }
      ],
      quickCheck: {
        prompt: "A student with escape-maintained disruption is placed on planned ignoring (attention extinction). After 4 weeks, disruption has WORSENED. Why?",
        answer: "FUNCTION MISMATCH. Planned ignoring withholds attention — but the behavior is maintained by ESCAPE from demands, not attention. Ignoring doesn't terminate the demand, so the behavior keeps producing escape (peer/teacher reactions remove pressure) and may be put on a leaner schedule of attention which can intensify it. Correct fix: escape extinction (continue the demand contingent on disruption) PLUS FCT for break requests.",
        hint: "Always match the procedure to the maintaining reinforcer. Mismatched procedures often INCREASE the behavior."
      },
      categorize: {
        title: "Match each presenting function to the most appropriate function-based intervention.",
        categories: [
          { id: 'attn',     label: 'Attention',          color: '#7c3aed' },
          { id: 'escape',   label: 'Escape',             color: '#dc2626' },
          { id: 'tangible', label: 'Access to Tangible', short: 'Tang', color: '#16a34a' },
          { id: 'auto',     label: 'Automatic',          color: '#2563eb' },
        ],
        items: [
          { text: "FCT teaching the client to tap a card to ask for a break, with escape extinction during the demand.", correct: 'escape', explanation: "Card produces same reinforcer (break) as problem behavior — function-matched for escape." },
          { text: "Planned ignoring + DRA for raising hand to gain teacher attention.", correct: 'attn', explanation: "Withholds attention contingent on problem behavior, teaches a communicative response to access it appropriately." },
          { text: "Noncontingent matched stimulation (vibrating pillow) + response interruption.", correct: 'auto', explanation: "Provides matched sensory consequence noncontingently; no social reinforcer to manipulate." },
          { text: "FCT teaching the client to ask for the iPad, plus brief denial training.", correct: 'tangible', explanation: "Replacement response produces same item; denial training builds tolerance." },
          { text: "Demand fading + FCT for break requests + DRA for compliance.", correct: 'escape', explanation: "Reduces aversive value of demands while teaching appropriate escape requests." },
          { text: "DRO (interval-based reinforcement for absence) with no replacement skill taught.", correct: 'auto', explanation: "Best fit when no clear social function and no obvious functional alternative — automatic reinforcement." },
        ],
      },
    },
    {
      // concept[3]: Discharge Planning and Fading Services
      example: "After 18 months of intensive ABA, Sienna, a 5-year-old, has met all her communication and social goals. Her BCBA, Mr. Vance, proposes a 12-week structured fade: reducing sessions from 25 to 15 to 5 hours per week across three phases, each contingent on Sienna maintaining skills at 90% across probes. He simultaneously trains her preschool teacher and parents to implement prompting and reinforcement procedures, and schedules a 90-day follow-up. The plan addresses the BACB's dual requirement to avoid unnecessary service continuation while also preventing abandonment.",
      keyTerms: [
        { term: "Systematic fading", def: "Gradual, data-based reduction of service intensity rather than abrupt discontinuation." },
        { term: "Abandonment", def: "Unethical abrupt termination of services without transition planning or referral." },
        { term: "Booster session", def: "Brief re-intervention scheduled after discharge when data indicate skill regression." },
        { term: "Natural environment training (NET)", def: "Teaching in everyday settings to support generalization and transition to natural contingencies." }
      ],
      quickCheck: {
        prompt: "An insurance company informs you that funding ends in 2 weeks. The client still has goals in progress. What's the BACB-aligned response, and what would constitute abandonment?",
        answer: "BACB-aligned: notify the family immediately, propose a structured transition plan (training caregivers, scheduling booster sessions, providing referrals to comparable services, sharing program documentation). Abandonment = abrupt discharge without any transition planning, referrals, or warning. Even with funding cut, the BCBA's obligation is to protect continuity of care, not just walk away.",
        hint: "Cutting services is sometimes unavoidable. What separates acceptable termination from abandonment?"
      }
    }
  ],

  "Personnel Supervision and Management": [
    {
      // concept[0]: Behavioral Skills Training (BST): The Evidence-Based Supervision Model
      example: "A new RBT, Carlos, receives a printed manual about discrete trial training and watches a video demonstration. His supervisor, Dr. Ellis, observes him with a client the next day and finds his error correction procedure is incorrect on 8 out of 10 trials. Dr. Ellis recognizes this as a BST failure — instruction and modeling were delivered but behavioral rehearsal with feedback was skipped. She conducts a role-play session that afternoon, provides immediate specific feedback, and re-observes Carlos with the client until his implementation reaches 95% fidelity.",
      keyTerms: [
        { term: "Behavioral rehearsal", def: "BST component requiring the supervisee to physically practice the skill, not just observe or read." },
        { term: "Specific feedback", def: "Precise statement of what was correct or incorrect and what to do differently; not general praise." },
        { term: "BST sequence", def: "Instruction, modeling, rehearsal, and feedback — all four components are required." },
        { term: "Performance criterion", def: "Pre-defined mastery level the supervisee must reach before BST is considered complete." }
      ],
      quickCheck: {
        prompt: "A new RBT watched a video, read the manual, and discussed the procedure in supervision — but in session he runs the procedure incorrectly. What's missing from the BST sequence, and what's the fix?",
        answer: "BEHAVIORAL REHEARSAL with FEEDBACK is missing. Instruction + modeling + discussion are not BST. Required: have the RBT physically practice (role-play with you or in vivo), provide immediate specific feedback after each attempt, and continue until they meet a defined performance criterion (e.g., 90% fidelity across 3 consecutive trials).",
        hint: "BST has four components. Skipping any one usually causes implementation failures."
      },
      categorize: {
        title: "Sort each supervisor activity into the BST component it represents.",
        categories: [
          { id: 'instruct', label: 'Instruction', color: '#7c3aed' },
          { id: 'model',    label: 'Modeling',    color: '#2563eb' },
          { id: 'rehearse', label: 'Rehearsal',   color: '#16a34a' },
          { id: 'feedback', label: 'Feedback',    color: '#dc2626' },
        ],
        items: [
          { text: "Supervisor verbally explains the rationale and step-by-step procedure for delivering token economy.", correct: 'instruct', explanation: "Verbal/written explanation of the procedure = instruction." },
          { text: "Supervisor records a video of herself running the procedure with a confederate client.", correct: 'model', explanation: "Demonstration of the skill = modeling." },
          { text: "RBT runs three role-play trials with the supervisor playing the client.", correct: 'rehearse', explanation: "Physically practicing the skill = behavioral rehearsal." },
          { text: "After each role-play trial, supervisor states: 'You delivered the token within 2 seconds — perfect timing. The praise statement was generic; try saying what specifically was correct.'", correct: 'feedback', explanation: "Specific, actionable post-performance information = feedback." },
          { text: "Supervisor sends a written protocol the night before training.", correct: 'instruct', explanation: "Written/verbal explanation = instruction component." },
          { text: "Supervisor demonstrates error correction live with the client while the RBT observes.", correct: 'model', explanation: "Demonstration in context = modeling." },
        ],
      },
    },
    {
      // concept[1]: Functional Assessment of Supervisee Performance Problems
      example: "RBT Maya's data accuracy drops from 92% to 74% over six weeks. Her supervisor, Ms. Jennings, resists the urge to mandate retraining immediately. Instead, she conducts a performance assessment: she reviews Maya's schedule and discovers Maya was recently assigned four new clients, adding 10 hours per week. The deficit is not a skills problem — Maya knows how to collect data — but an environmental one. Ms. Jennings advocates for caseload reduction with the clinical director, restoring accuracy to 90% without any retraining at all.",
      keyTerms: [
        { term: "Skills deficit", def: "Supervisee cannot perform the skill correctly; requires training (BST) as the intervention." },
        { term: "Performance deficit", def: "Supervisee can perform correctly but does not; requires consequence or environmental modification." },
        { term: "Antecedent analysis", def: "Examining environmental conditions that precede poor supervisee performance." },
        { term: "Performance improvement plan", def: "Formal corrective document; should follow, not precede, functional assessment of the problem." }
      ],
      quickCheck: {
        prompt: "An RBT used to run programs accurately but his fidelity has dropped to 65%. Before mandating retraining, what's the question you should answer first — and why?",
        answer: "Is this a SKILLS deficit or a PERFORMANCE deficit? Skills deficit = can't (training fix). Performance deficit = can but doesn't (consequence/environmental fix). If he previously demonstrated mastery, retraining usually wastes effort — look for environmental contributors (caseload increase, schedule changes, low reinforcement for accurate data, conflicting demands). The functional assessment determines the right intervention.",
        hint: "Treat supervisee performance the same way you'd treat client behavior — assess function before intervening."
      }
    },
    {
      // concept[2]: Culturally Responsive Supervision
      example: "New BCBA supervisee Hana immigrated from Japan six months ago and is technically strong but rarely asks questions or challenges treatment recommendations in supervision. Her supervisor, Dr. Brooks, initially interprets this as disengagement. Instead of waiting, she proactively discusses cultural communication norms in supervision, explicitly invites and reinforces Hana's disagreements with specific verbal praise, and restructures supervision to allow written question submissions before meetings. Hana's active participation increases substantially once the environmental barriers are addressed.",
      keyTerms: [
        { term: "Cultural humility", def: "Ongoing self-reflection and openness to learning about others' cultural contexts and perspectives." },
        { term: "Communication style adaptation", def: "Modifying supervision format to accommodate supervisee's cultural and linguistic background." },
        { term: "Equity in supervision", def: "Ensuring supervisees from underrepresented groups receive equitable access to development opportunities." },
        { term: "Cultural match misconception", def: "False assumption that shared ethnicity guarantees cultural competence with a client population." }
      ],
      quickCheck: {
        prompt: "A new supervisee from a culture where direct disagreement with authority is rare consistently nods 'yes' in supervision but doesn't implement changes. What's the supervisor's responsibility, and what's a concrete adaptation?",
        answer: "Recognize that the supervisee may be communicating agreement out of cultural respect, not actual understanding/buy-in. Supervisor responsibility: don't force adaptation onto the supervisee — adapt the SUPERVISION FORMAT. Concrete moves: invite written feedback before/after meetings, explicitly normalize and reinforce disagreement, use anonymous question forms, schedule 1:1 follow-ups, use behavior-rehearsal-based fidelity checks instead of self-report.",
        hint: "Cultural responsiveness puts the burden of adaptation on the supervisor, not the supervisee."
      }
    },
    {
      // concept[3]: Evaluating Supervisory Effectiveness: Data-Based Approaches
      example: "BCBA supervisor Dr. Thomas reviews her annual effectiveness by tallying the percentage of sessions where supervisees met performance objectives, the percentage of her supervisees' clients who met treatment goals, and 90-day supervisee retention rates. She discovers that new RBTs in their first six months have markedly lower competency ratings than longer-tenured staff — suggesting her onboarding BST protocol needs strengthening. She redesigns the first-month protocol, collects comparison data the next cohort, and finds a 22% improvement in early-phase competency ratings.",
      keyTerms: [
        { term: "Outcome data", def: "Supervisory effectiveness metric based on supervisee skill acquisition and client progress." },
        { term: "Process data", def: "Metrics tracking supervision hours and meetings held; necessary but insufficient to assess effectiveness." },
        { term: "Supervisee retention", def: "Percentage of supervisees remaining in role over time; reflects supervision quality indirectly." },
        { term: "Competency checklist", def: "Structured observational tool documenting supervisee performance on defined behavioral objectives." }
      ],
      quickCheck: {
        prompt: "A supervisor reports she had 92 hours of supervision meetings and 18 supervisees this year. Why is this insufficient evidence that her supervision is EFFECTIVE?",
        answer: "Those are PROCESS DATA — they show that supervision happened, not that it produced results. Effectiveness requires OUTCOME DATA: supervisees' skill acquisition (e.g., percent meeting performance objectives), their CLIENTS' progress, retention rates, and competency-checklist gains over time. Process without outcome data is activity, not effectiveness.",
        hint: "Two kinds of data — one shows what you did, the other shows what changed."
      }
    }
  ]
};
