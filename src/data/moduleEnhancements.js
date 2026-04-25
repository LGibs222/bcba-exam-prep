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
      ]
    },
    {
      // concept[1]: Philosophical Assumptions: Determinism, Empiricism, Parsimony, and Philosophic Doubt
      example: "Marcus, a 9-year-old with ASD, begins hitting peers during lunch. A colleague suggests he hits because he 'has poor impulse control.' His BCBA, Dr. Rivera, invokes parsimony and insists on ruling out observable antecedents and consequences before accepting that label. She collects ABC data for two weeks, finds that hitting reliably occurs when Marcus is seated next to a loud peer and is followed by seat relocation, and designs an antecedent intervention — demonstrating that a simpler, environmental explanation was sufficient.",
      keyTerms: [
        { term: "Determinism", def: "All behavior has identifiable environmental and genetic causes; free will is rejected." },
        { term: "Parsimony", def: "Accept the simplest scientifically adequate explanation before invoking complex ones." },
        { term: "Philosophic doubt", def: "Ongoing willingness to revise conclusions when new evidence conflicts with current views." },
        { term: "Empiricism", def: "Knowledge must be grounded in systematic, objective observation, not tradition or authority." }
      ]
    },
    {
      // concept[2]: Radical Behaviorism and Private Events
      example: "Destiny, a 16-year-old with anxiety, tells her BCBA, Ms. Okafor, 'I feel dread before I have to speak in class and that is why I refuse.' Ms. Okafor does not dismiss the dread or treat it as a cause; instead, she treats it as behavior that also has an environmental history — likely a history of aversive outcomes in social-performance contexts. She targets the public verbal refusal directly while acknowledging that the private feeling is real, follows the same principles as public behavior, and will likely diminish as the social contingencies change.",
      keyTerms: [
        { term: "Private events", def: "Thoughts, feelings, and physiological states treated as behaviors, not mentalistic causes." },
        { term: "Methodological behaviorism", def: "Earlier view that dismissed private events entirely as outside scientific study." },
        { term: "Mentalistic explanation", def: "Explaining behavior by hypothetical internal constructs like 'will' or 'trait' — rejected in radical behaviorism." },
        { term: "Radical behaviorism", def: "Skinner's framework accepting private events as behavior subject to the same environmental principles." }
      ]
    },
    {
      // concept[3]: The Seven Dimensions of ABA (Baer, Wolf, and Risley, 1968)
      example: "A BCBA, Mr. Alvarez, designs a social-skills program for Priya, an 11-year-old with ASD. His supervisor flags that the written protocol uses the vague phrase 'prompt as needed' — violating the technological dimension because another clinician could not replicate it. Mr. Alvarez rewrites the protocol specifying exact prompt types, timing, and fading criteria, which also satisfies the conceptually systematic dimension by grounding every step in stimulus control transfer principles rather than intuition.",
      keyTerms: [
        { term: "Technological", def: "Procedures described completely enough for independent replication by another practitioner." },
        { term: "Conceptually systematic", def: "Procedures explained by and derived from established behavioral principles." },
        { term: "Generality", def: "Behavior change persists across time, settings, people, and untrained behaviors." },
        { term: "Applied", def: "Targets behaviors of genuine social significance to the individual and community." }
      ]
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
      ]
    },
    {
      // concept[1]: Reinforcement Schedules and Their Behavioral Characteristics
      visual: "schedule_graph",
      example: "Kezia, a 14-year-old, earns tokens for completing math problems. On a fixed-ratio 5 schedule (FR5), her BCBA, Dr. Webb, notices she blazes through sets of five problems then stops and stares out the window — the textbook post-reinforcement pause. When Dr. Webb switches to a variable-ratio schedule averaging 5 (VR5), Kezia works at a steady, rapid clip throughout the session with almost no pausing, because she cannot predict exactly which response will produce the token.",
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
      ]
    },
    {
      // concept[3]: Extinction: Mechanisms, Bursts, and Clinical Management
      visual: "extinction_graph",
      example: "Nadia, a 5-year-old, has been crying at bedtime to gain parental attention. Her parents, coached by BCBA Ms. Torres, begin planned ignoring (extinction for attention-maintained crying). On night three, Nadia cries for 45 uninterrupted minutes at twice her usual volume — an extinction burst. Ms. Torres prepares the family for this in advance, emphasizing that the burst does not mean the intervention is failing. By night seven, crying drops to under two minutes, and Ms. Torres labels a brief return of loud crying on night ten a spontaneous recovery, not a relapse.",
      keyTerms: [
        { term: "Extinction burst", def: "Temporary increase in response rate, intensity, or variability at the start of extinction." },
        { term: "Spontaneous recovery", def: "Brief return of extinguished behavior after a period of no responding; not treatment failure." },
        { term: "Function-specific extinction", def: "Extinction must match the maintaining function; mismatched extinction is ineffective or harmful." },
        { term: "Resurgence", def: "Return of a previously extinguished behavior when a more recent behavior is placed on extinction." }
      ]
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
      ]
    },
    {
      // concept[1]: Interobserver Agreement: Calculation, Adequacy, and Limitations
      example: "Two observers collect data on Cooper, a 12-year-old, using partial interval recording for stereotypy. They reach 91% IOA — which seems excellent. But BCBA Dr. Osei notices that both observers are reliably scoring nearly every interval as 'occurred,' regardless of actual behavior, because the 30-second intervals are too long. The high IOA reflects consistent over-measurement, not valid measurement. He switches both observers to event recording, and their IOA drops to 72% initially, revealing genuine disagreement about what counts as stereotypy — the real problem to solve.",
      keyTerms: [
        { term: "Smaller/larger IOA", def: "For count data: (smaller count divided by larger count) multiplied by 100; standard for frequency measures." },
        { term: "Interval-by-interval IOA", def: "Agreements divided by agreements plus disagreements, times 100; more sensitive than total count." },
        { term: "Reliability vs. validity", def: "High IOA means observers agree; it does NOT mean they are measuring the right thing." },
        { term: "Observer drift", def: "Gradual, unintentional shift in how observers apply the behavioral definition over time." }
      ]
    },
    {
      // concept[2]: Visual Analysis of Single-Subject Data
      example: "BCBA Ms. Huang is reviewing graphs for Amara, a 6-year-old, whose tantrum frequency during baseline shows a strong downward trend before intervention even begins. A less experienced colleague interprets the continued decrease in the intervention phase as proof of treatment effectiveness. Ms. Huang explains that the baseline trend is a confound: if behavior was already improving, any further decrease during intervention cannot be attributed to the treatment alone — internal validity is compromised and the design should have delayed intervention until the baseline stabilized.",
      keyTerms: [
        { term: "Level", def: "Mean height of data points within a phase; assessed visually or as a median split." },
        { term: "Trend", def: "Direction and slope of the data path within a phase; can be increasing, decreasing, or flat." },
        { term: "Variability", def: "Scatter of data points around the trend line; high variability complicates interpretation." },
        { term: "Data overlap", def: "Data points from one phase falling within the range of adjacent-phase data; reduces confidence." }
      ]
    },
    {
      // concept[3]: Treatment Integrity and Social Validity
      example: "A token economy for Devon, an 8-year-old, shows 35% improvement in on-task behavior. His BCBA, Mr. Reyes, is ready to declare it effective — but treatment integrity monitoring shows teachers delivered tokens on only 55% of planned opportunities. Mr. Reyes cannot conclude the token economy is effective; he can only conclude that partial implementation is associated with partial improvement. He runs staff training to bring fidelity above 90% before drawing any conclusions about the procedure's true effectiveness.",
      keyTerms: [
        { term: "Treatment integrity", def: "Degree to which an intervention is implemented exactly as designed and specified." },
        { term: "Social validity", def: "Acceptability and meaningfulness of goals, procedures, and outcomes to clients and stakeholders." },
        { term: "Procedural fidelity", def: "Synonym for treatment integrity; often measured as percentage of steps implemented correctly." },
        { term: "Wolf (1978)", def: "Author who introduced social validity to ABA; described significance of goals, procedures, and outcomes." }
      ]
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
      ]
    },
    {
      // concept[1]: Reversal (ABAB) Design: Logic, Strengths, and Ethical Limits
      example: "Dr. Patel is using an ABAB design with Rowan, a 7-year-old, targeting stereotypic hand-flapping maintained by automatic reinforcement. In A2 (second baseline, treatment withdrawn), hand-flapping fails to return to baseline levels — the behavior does not reverse. This tells Dr. Patel the reversal design was a poor choice here: either the behavior has become irreversible due to behavioral history, or a variable outside his intervention is maintaining the lower rates. He switches to a multiple-baseline design for future skill-acquisition targets to avoid this limitation.",
      keyTerms: [
        { term: "Experimental control", def: "Demonstrated when behavior changes reliably and repeatedly with the independent variable." },
        { term: "Irreversible behavior", def: "Learned skill unlikely to return to baseline once acquired; reversal designs are inappropriate." },
        { term: "Replication of effect", def: "Behavior change occurring across both B phases strengthens causal inference in ABAB." },
        { term: "A2 phase", def: "Second baseline — treatment withdrawal; behavior should return toward baseline to demonstrate control." }
      ]
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
      ]
    },
    {
      // concept[3]: Alternating Treatments Design: Comparison and Carryover
      example: "BCBA Dr. Kowalski wants to compare errorless learning versus trial-and-error teaching for Mia, a 5-year-old learning to identify shapes. He uses an ATD, rapidly alternating the two conditions across daily sessions with counterbalanced order. After 10 sessions the data paths clearly diverge — Mia's accuracy is consistently higher in the errorless learning condition. Because he counterbalanced condition order, Dr. Kowalski is confident the divergence reflects true differential effectiveness rather than carryover from one condition influencing performance in the other.",
      keyTerms: [
        { term: "Carryover effect", def: "Exposure to one condition alters responding in the immediately following condition." },
        { term: "Counterbalancing", def: "Varying the order of conditions across sessions to distribute carryover effects equally." },
        { term: "Divergence", def: "Visual separation of data paths in ATD indicating differential effectiveness of conditions." },
        { term: "Multielement design", def: "Alternative name for ATD; emphasizes rapid alternation of multiple independent conditions." }
      ]
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
      ]
    },
    {
      // concept[1]: Informed Consent: What It Requires and When It Is Not Sufficient
      example: "Parents of Sofia, a 4-year-old with ASD, sign consent for a punishment-based procedure after reviewing written materials. BCBA Dr. Oguike realizes less restrictive alternatives — DRA and FCT — have not been tried and are likely to produce similar results. Even though consent was freely given, he declines to implement the punishment procedure without first documenting that less restrictive alternatives were considered and found insufficient, because informed consent does not override his ethical obligation to pursue least restrictive treatment first.",
      keyTerms: [
        { term: "Informed consent", def: "Voluntary, knowledgeable agreement by a competent person after receiving complete information." },
        { term: "Capacity to consent", def: "Client's ability to understand information and make voluntary decisions; may require a surrogate." },
        { term: "Assent", def: "Client's affirmative agreement to participate, distinct from legal consent by a guardian." },
        { term: "Coercion", def: "Pressure that undermines voluntariness of consent; invalidates the consent process." }
      ]
    },
    {
      // concept[2]: Addressing Ethical Violations by Colleagues: Graduated Response
      example: "At a team meeting, BCBA Mr. Kim notices that his colleague is routinely implementing a restrictive procedure without documented parental consent. He addresses it privately in a one-on-one conversation — the colleague claims parents verbally agreed but has no documentation. Mr. Kim asks her to obtain written consent immediately and offers to help with the form. She complies within 24 hours. Because the issue was resolved informally and the client was not harmed, Mr. Kim does not escalate to the BACB, but documents his concern and its resolution in his own records.",
      keyTerms: [
        { term: "Graduated response", def: "Ethics Code approach: informal first, then formal channels, then regulatory reporting." },
        { term: "Informal resolution", def: "Directly addressing a concern with a colleague before involving supervisors or regulators." },
        { term: "BACB reporting", def: "Filing a formal complaint with the BACB; reserved for serious harm, fraud, or unresolved violations." },
        { term: "Documentation", def: "Written record of ethical concerns, actions taken, and outcomes; protects all parties involved." }
      ]
    },
    {
      // concept[3]: Competence: Boundaries, Expansion, and Telehealth
      example: "BCBA Dr. Walsh has extensive experience with children but is asked to develop a behavior support plan for an adult with dementia in a memory care facility. Rather than declining or accepting without preparation, she discloses her competence boundary to the referral source, enrolls in a continuing education course on geriatric behavioral health, and arranges monthly consultation with a BCBA experienced in older adult populations. She begins services only after completing the training and securing consultation, documenting her competence-expansion process throughout.",
      keyTerms: [
        { term: "Scope of competence", def: "Boundaries of a BCBA's practice defined by education, training, and supervised experience." },
        { term: "Competence expansion", def: "Adding new population or technique competence via training, supervision, and consultation." },
        { term: "Telehealth competence", def: "Requires clinical, delivery-modality, and jurisdiction-specific regulatory knowledge." },
        { term: "Disclosure of limitations", def: "Ethical obligation to inform clients when referral or supervision is needed due to competence gaps." }
      ]
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
      ]
    },
    {
      // concept[1]: Functional Analysis: Interpreting Ambiguous and Undifferentiated Results
      example: "BCBA Ms. Yee conducts a standard FA for Bianca, a 7-year-old, and sees elevated self-injury in every condition including control. Before concluding Bianca has multiple functions, Ms. Yee audits her protocol: the control condition contained only two toys Bianca had already habituated to, meaning it was not truly an enriched environment. She replaces the control toys, reruns the FA, and finds clear differentiation — self-injury elevates only in the demand condition, consistent with an escape function.",
      keyTerms: [
        { term: "Undifferentiated results", def: "FA pattern where behavior is elevated across all conditions; often reflects methodological issues." },
        { term: "Control condition", def: "FA condition with enriched environment and no programmed consequences; tests automatic function." },
        { term: "Attention condition", def: "FA condition testing social-positive reinforcement via brief contingent attention delivery." },
        { term: "Demand condition", def: "FA condition testing negative reinforcement via escape from presented tasks or demands." }
      ]
    },
    {
      // concept[2]: Preference Assessments: Preference vs. Reinforcing Function
      example: "A paired-stimulus assessment identifies cars as Mateo's highest-preference item. His BCBA, Dr. Cruz, builds a teaching program using cars as the only reinforcer. After two weeks, Mateo's response rates decline. Dr. Cruz conducts a reinforcer assessment and discovers that cars are no longer functioning as reinforcers — Mateo has satiated on them because he plays with them freely at home for hours each day. She diversifies the reinforcer pool and implements a formal reinforcer assessment before each session, not just at program outset.",
      keyTerms: [
        { term: "Paired stimulus assessment", def: "Preference assessment presenting two items simultaneously; client selects one; yields ranked hierarchy." },
        { term: "Satiation", def: "Decreased reinforcing value of a stimulus due to recent, extensive access." },
        { term: "Reinforcer assessment", def: "Direct test of whether a preferred stimulus increases future behavior when delivered contingently." },
        { term: "Free operant observation", def: "Preference assessment tracking time spent with items in unrestricted, naturalistic access." }
      ]
    },
    {
      // concept[3]: Social Validity Assessment: Goals, Procedures, and Outcomes
      example: "BCBA Ms. Kamara achieves a technically excellent outcome: Kenji, a 15-year-old, has reduced his public self-stimulatory behavior by 80% through a response interruption and redirection program. But a post-treatment social validity questionnaire reveals that Kenji finds the procedure humiliating and has started avoiding settings where staff are present. Ms. Kamara uses this data to redesign the intervention around self-management instead, recognizing that a client who avoids treatment settings has not truly benefited from the behavior change.",
      keyTerms: [
        { term: "Social significance", def: "Whether the targeted behavior goal matters meaningfully to the client and their community." },
        { term: "Normative comparison", def: "Social validity method comparing client's behavior to peers in the same setting." },
        { term: "Wolf (1978)", def: "Introduced social validity to ABA; emphasized three levels: goals, procedures, and outcomes." },
        { term: "Stakeholder", def: "Anyone affected by the intervention — client, caregivers, teachers, community members." }
      ]
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
      ]
    },
    {
      // concept[1]: Differential Reinforcement: DRO, DRI, DRA, and DRL
      example: "Keanu, a 10-year-old, screams for attention. His team debates whether to use DRO or FCT. His BCBA, Dr. Park, explains that DRO would reinforce any behavior other than screaming every 3 minutes — but Keanu still would have no way to get attention appropriately, so screaming is likely to return. She selects DRA using FCT, teaching Keanu to tap a communication card to request attention. The DRA addresses the function of screaming rather than simply suppressing it, making the behavior change more durable.",
      keyTerms: [
        { term: "DRO", def: "Reinforces the absence of the target behavior; function-agnostic and does not teach replacement skills." },
        { term: "DRI", def: "Reinforces behavior physically impossible to perform simultaneously with the target behavior." },
        { term: "DRA", def: "Reinforces a functionally equivalent alternative behavior; often used alongside FCT." },
        { term: "DRL", def: "Reinforces the target behavior only when its rate falls at or below a specified criterion." }
      ]
    },
    {
      // concept[2]: Chaining: Forward, Backward, and Total Task
      example: "Marcus, a 13-year-old with intellectual disability, is learning to make a sandwich. His BCBA, Ms. Chen, uses backward chaining: Marcus is prompted through all steps except the last (placing the sandwich on the plate), which he performs independently and is immediately reinforced. Over weeks, the final independently performed step moves progressively earlier in the chain. Ms. Chen chooses backward chaining over forward chaining because Marcus experiences completing the full task every session, maintaining his motivation in a way that stopping mid-chain in forward chaining does not.",
      keyTerms: [
        { term: "Backward chaining", def: "Teaches last step first; client always completes the full chain and receives terminal reinforcement." },
        { term: "Forward chaining", def: "Teaches first step first; subsequent steps prompted until independence criteria are met sequentially." },
        { term: "Total task presentation", def: "Client attempts all steps every session with prompts provided as needed throughout the chain." },
        { term: "Task analysis", def: "Breaking a complex skill into discrete sequential steps; quality directly affects chaining outcomes." }
      ]
    },
    {
      // concept[3]: Generalization Programming: Teaching for Transfer
      example: "Priya, a 7-year-old, can independently request a snack using her AAC device with Ms. Lewis but falls silent when any other adult is present. Her BCBA, Dr. Singh, identifies a stimulus generalization failure and implements multiple-exemplar training, systematically introducing requests across 10 different communication partners in three different settings over four weeks. He also programs natural maintaining contingencies by training cafeteria staff so that Priya's independent requests are reinforced in the real world, not just in therapy.",
      keyTerms: [
        { term: "Stimulus generalization", def: "Behavior occurring with stimuli similar to, but not identical to, the original training stimuli." },
        { term: "Multiple exemplar training", def: "Training across varied instances to broaden stimulus control and promote generalization." },
        { term: "Natural maintaining contingency", def: "Reinforcement available in the natural environment that sustains generalized behavior change." },
        { term: "Training loosely", def: "Varying non-essential features of training stimuli to broaden the generalization gradient." }
      ]
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
      ]
    },
    {
      // concept[1]: Treatment Integrity Monitoring and Its Implications for Clinical Decisions
      example: "An FCT program for Gabrielle, a 9-year-old, shows no improvement after six weeks. Before abandoning FCT, her BCBA, Ms. Nakamura, pulls integrity data and finds that classroom aides are only honoring Gabrielle's communication card on 40% of opportunities — they frequently miss or delay the response. Ms. Nakamura concludes that FCT has not actually been tested at adequate fidelity. She runs a staff BST session, brings integrity to 92%, and observes a 60% reduction in problem behavior within two weeks — confirming the procedure was never the problem.",
      keyTerms: [
        { term: "Treatment integrity", def: "Percentage of intervention steps implemented correctly as specified in the written protocol." },
        { term: "Fidelity threshold", def: "Minimum acceptable integrity level (typically 80%+) before data can be attributed to the procedure." },
        { term: "Component analysis", def: "Identifying which specific elements of a multi-component package produce behavior change." },
        { term: "Implementation science", def: "Study of how to translate evidence-based practices into real-world clinical settings effectively." }
      ]
    },
    {
      // concept[2]: Function-Based Intervention Selection: Matching Procedure to Maintaining Variable
      example: "Dominique, a 15-year-old, disrupts class by making loud comments. A previous BCBA implemented planned ignoring (attention extinction). Disruptions got worse. The new BCBA, Dr. Harmon, reviews the functional assessment and discovers that disruptions are actually maintained by escape from difficult tasks — peers laughing at the teacher's reaction removes the task pressure. Ignoring teacher attention is completely mismatched to the escape function. Dr. Harmon implements demand fading and FCT for break requests, and disruptions drop by 70% within three weeks.",
      keyTerms: [
        { term: "Function-matched intervention", def: "Treatment whose mechanism directly targets the identified maintaining reinforcer." },
        { term: "Escape extinction", def: "Preventing escape from the demand contingent on problem behavior; for escape-maintained behavior." },
        { term: "FCT (functional communication training)", def: "Teaching a communication response that produces the same reinforcer as the problem behavior." },
        { term: "Function mismatch", def: "Applying a procedure targeting a different function than what actually maintains behavior; ineffective or harmful." }
      ]
    },
    {
      // concept[3]: Discharge Planning and Fading Services
      example: "After 18 months of intensive ABA, Sienna, a 5-year-old, has met all her communication and social goals. Her BCBA, Mr. Vance, proposes a 12-week structured fade: reducing sessions from 25 to 15 to 5 hours per week across three phases, each contingent on Sienna maintaining skills at 90% across probes. He simultaneously trains her preschool teacher and parents to implement prompting and reinforcement procedures, and schedules a 90-day follow-up. The plan addresses the BACB's dual requirement to avoid unnecessary service continuation while also preventing abandonment.",
      keyTerms: [
        { term: "Systematic fading", def: "Gradual, data-based reduction of service intensity rather than abrupt discontinuation." },
        { term: "Abandonment", def: "Unethical abrupt termination of services without transition planning or referral." },
        { term: "Booster session", def: "Brief re-intervention scheduled after discharge when data indicate skill regression." },
        { term: "Natural environment training (NET)", def: "Teaching in everyday settings to support generalization and transition to natural contingencies." }
      ]
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
      ]
    },
    {
      // concept[1]: Functional Assessment of Supervisee Performance Problems
      example: "RBT Maya's data accuracy drops from 92% to 74% over six weeks. Her supervisor, Ms. Jennings, resists the urge to mandate retraining immediately. Instead, she conducts a performance assessment: she reviews Maya's schedule and discovers Maya was recently assigned four new clients, adding 10 hours per week. The deficit is not a skills problem — Maya knows how to collect data — but an environmental one. Ms. Jennings advocates for caseload reduction with the clinical director, restoring accuracy to 90% without any retraining at all.",
      keyTerms: [
        { term: "Skills deficit", def: "Supervisee cannot perform the skill correctly; requires training (BST) as the intervention." },
        { term: "Performance deficit", def: "Supervisee can perform correctly but does not; requires consequence or environmental modification." },
        { term: "Antecedent analysis", def: "Examining environmental conditions that precede poor supervisee performance." },
        { term: "Performance improvement plan", def: "Formal corrective document; should follow, not precede, functional assessment of the problem." }
      ]
    },
    {
      // concept[2]: Culturally Responsive Supervision
      example: "New BCBA supervisee Hana immigrated from Japan six months ago and is technically strong but rarely asks questions or challenges treatment recommendations in supervision. Her supervisor, Dr. Brooks, initially interprets this as disengagement. Instead of waiting, she proactively discusses cultural communication norms in supervision, explicitly invites and reinforces Hana's disagreements with specific verbal praise, and restructures supervision to allow written question submissions before meetings. Hana's active participation increases substantially once the environmental barriers are addressed.",
      keyTerms: [
        { term: "Cultural humility", def: "Ongoing self-reflection and openness to learning about others' cultural contexts and perspectives." },
        { term: "Communication style adaptation", def: "Modifying supervision format to accommodate supervisee's cultural and linguistic background." },
        { term: "Equity in supervision", def: "Ensuring supervisees from underrepresented groups receive equitable access to development opportunities." },
        { term: "Cultural match misconception", def: "False assumption that shared ethnicity guarantees cultural competence with a client population." }
      ]
    },
    {
      // concept[3]: Evaluating Supervisory Effectiveness: Data-Based Approaches
      example: "BCBA supervisor Dr. Thomas reviews her annual effectiveness by tallying the percentage of sessions where supervisees met performance objectives, the percentage of her supervisees' clients who met treatment goals, and 90-day supervisee retention rates. She discovers that new RBTs in their first six months have markedly lower competency ratings than longer-tenured staff — suggesting her onboarding BST protocol needs strengthening. She redesigns the first-month protocol, collects comparison data the next cohort, and finds a 22% improvement in early-phase competency ratings.",
      keyTerms: [
        { term: "Outcome data", def: "Supervisory effectiveness metric based on supervisee skill acquisition and client progress." },
        { term: "Process data", def: "Metrics tracking supervision hours and meetings held; necessary but insufficient to assess effectiveness." },
        { term: "Supervisee retention", def: "Percentage of supervisees remaining in role over time; reflects supervision quality indirectly." },
        { term: "Competency checklist", def: "Structured observational tool documenting supervisee performance on defined behavioral objectives." }
      ]
    }
  ]
};
