Comprehensive Reference for Chrome Built-in AI APIs (Gemini Nano)
I. Introduction to Chrome Built-in AI Architecture
The Chrome platform introduces a powerful suite of built-in AI APIs designed to enable extensions and web applications to leverage sophisticated generative models directly within the user's browser environment. This architectural approach, centered around client-side and on-device processing, fundamentally shifts the paradigm for AI integration by prioritizing user privacy and performance.   

1.1 Architectural Context: Client-Side AI and Gemini Nano
Chrome's built-in AI primarily utilizes purpose-built, highly optimized models, notably Gemini Nano. This client-side execution model offers significant advantages critical for extension development, especially when handling sensitive data or aiming for a seamless user experience.   

Client-side AI ensures that computationally intensive tasks, such as summarization, translation, and text generation, occur locally on the user's device. This strategy yields several benefits: enhanced user privacy, as sensitive data is protected by remaining local; improved latency and faster response times, achieved by eliminating network overhead for inference; and the ability to operate offline, maintaining functionality even without a continuous internet connection.   

A critical design efficiency of this approach lies in the management of the underlying model. When a built-in AI feature is enabled, Chrome downloads Gemini Nano once. This single instance of the model is then shared across various origins and extensions, operating with maximum inference performance across different web applications or extension contexts. This optimized sharing mechanism minimizes redundant resource consumption and disk space usage across the system.   

1.2 Architectural Distinction: Built-in AI (chrome.ai) vs. Cloud AI (Gemini API)
It is crucial for developers to distinguish between the capabilities of the on-device built-in AI APIs and Google's cloud-hosted AI solutions.

The built-in APIs, running on Gemini Nano, are optimized for low-latency, privacy-sensitive tasks using purpose-built models tailored for browser-specific functions. These APIs excel at tasks like rapid content rewriting or real-time language detection.   

Conversely, Cloud AI, accessible via the comprehensive Gemini API ecosystem, offers scalability, raw computational power, and access to cutting-edge hardware and software through cloud platforms. Cloud platforms provide standard, streaming, and WebSocket-based API endpoints, suitable for highly complex, resource-intensive, or massive-scale generative tasks, such as multimodal requests or those requiring extensive context windows.   

For developers seeking the most resilient and scalable solutions, the architecture favors a Hybrid AI Strategy. Developers are advised to initially employ the low-cost, low-latency built-in APIs (Nano) for eligible tasks. The Gemini Cloud API should be integrated as a seamless fallback mechanism or an optional upgrade path for users who require advanced capabilities that exceed the limitations of the on-device Nano model, thereby maximizing both performance and feature scope.   

II. Prerequisites, Setup, and Extension Lifecycle
The client-side nature of the built-in AI APIs introduces stringent hardware and software requirements that developers must account for to ensure their extensions function correctly for the target user base.

2.1 Hardware, Operating System, and Storage Requirements
The use of Gemini Nano for APIs such as the Prompt, Summarizer, Writer, Rewriter, and Proofreader imposes significant constraints on the host machine. Developers must build robust checks and communication strategies around these requirements.   

Operating System and Platform Support: The APIs require specific desktop operating systems: Windows 10 or 11, macOS 13+ (Ventura and onwards), Linux, or ChromeOS (specifically Platform 16389.0.0 and onwards on Chromebook Plus devices). Crucially, Chrome for Android, iOS, and non-Chromebook Plus devices are not currently supported by the Gemini Nano-dependent APIs.   

Resource Requirements: Due to the size and computational nature of the on-device models, hardware specifications are non-negotiable:

Storage: The most significant prerequisite is the storage commitment. At least 22 GB of free space is required on the volume containing the Chrome profile to accommodate the model download.   

Compute: The model can utilize either the GPU or CPU, provided minimum specifications are met:

GPU: Strictly more than 4 GB of VRAM.   

CPU: 16 GB of RAM or more, coupled with 4 CPU cores or more.   

These requirements necessitate a robust mitigation strategy built into the extension. The substantial resource commitment means that developers must use the API's availability checks as the first line of defense. The application must clearly communicate to the user if the hardware or operating system does not meet these criteria, as the feature will simply be reported as "unavailable".   

Table 1 summarizes the necessary prerequisites for using the Gemini Nano-dependent built-in AI APIs.

Table 1: Built-in AI (Gemini Nano) Hardware and OS Prerequisites

Requirement Category	Minimum Specification	Applicable APIs
Operating System	
Windows 10/11; macOS 13+ (Ventura+); Linux; ChromeOS (Platform 16389.0.0+ on Chromebook Plus) 

Prompt, Summarizer, Writer, Rewriter, Proofreader 

Mobile Support	
Chrome for Android, iOS, and non-Chromebook Plus ChromeOS not supported 

All Gemini Nano APIs 

Storage	
At least 22 GB of free space on the Chrome profile volume 

All Gemini Nano APIs 

GPU (If Available)	
Strictly > 4 GB of VRAM 

All Gemini Nano APIs 

CPU (If GPU Unavailable)	
16 GB of RAM or more, and 4 CPU cores or more 

All Gemini Nano APIs 

  
2.2 API Life Cycle: Availability, User Activation, and Model Download
All Gemini Nano-dependent built-in APIs follow a critical workflow designed for resource management and user consent.

Availability Check: Before initiating any AI task, developers must call the static, asynchronous *.availability() method for the respective API (e.g., Summarizer.availability()). This method returns a status indicating the model's readiness: 'available' (model is loaded), 'downloadable' (model is not present but can be downloaded), or 'unavailable' (hardware or OS constraints prevent use).   

Model Download and Monitoring: If the status is 'downloadable', the model download must be triggered. Since this download consumes significant bandwidth and disk space, the asynchronous *.create() function, which triggers initialization, supports an optional monitor callback. This function allows the developer to register an event listener (downloadprogress) to track the progress of the multi-gigabyte model download and inform the user of the potential delay.   

User Activation Mandate: The resource commitment associated with the model download directly mandates a strict user protection mechanism. The static *.create() method must only be invoked in response to an explicit user gesture (such as a click or key press). This is enforced by requiring developers to check for navigator.userActivation.isActive prior to calling create(). This requirement ensures that the user actively intends to use the feature and authorizes the large, costly initial download, preventing extensions from consuming bandwidth and storage without explicit consent.   

2.3 Manifest V3 Permissions and Experimental Status
To access the built-in AI functionality within a Chrome Extension, the extension must declare its intent within the manifest.json file. While not explicitly documented in all snippets, standard Chrome API convention suggests that use of the chrome.ai namespace requires inclusion of the "ai" permission string within the manifest's permissions array.   

It is imperative that developers recognize the highly experimental status of these interfaces. Many of the built-in AI APIs are currently in active development, typically accessible via Origin Trials or the Early Preview Program (EPP). For example, the Proofreader API was available during Chrome versions 141 through 145, and the Writer/Rewriter APIs were available in Chrome 137 through 142. This active phase means developers must anticipate potential API changes, modifications, or deprecation, and must ensure their end-users are running a Chrome version compatible with the active trial window.   

III. Core Generative API: The Prompt API
The Prompt API serves as the general-purpose, text-generation interface within the built-in AI suite, providing direct access to the underlying Gemini Nano LLM.   

3.1 Session Management and Multimodal Capabilities
The Prompt API is designed to function similarly to other LLM interfaces but simplifies access by requiring the developer to use the specific model shipped with the browser instance, avoiding complex model selection configuration.   

Interaction with the Prompt API is handled through a session lifecycle, initiated by Prompt.create(). Once created, the session allows for continuous dialogue, context retention, and resource management. Context is established through initial prompts and maintained by appending subsequent messages to the session history. Furthermore, the API supports multimodal capabilities, allowing for inputs and outputs that extend beyond simple text.   

For efficiency, a developer can manage resources by using session.clone() to create a duplicate session for speculative or parallel tasks, or by using session.terminate() to explicitly release the model resources when the task is complete, which is essential for effective memory management in extensions.   

Table 2: Prompt API Session Control Methods

Method	Type	Functionality	Note
Prompt.availability()	Static, Async	
Checks model readiness.

Returns status ('available', 'downloadable')
Prompt.create()	Static, Async	
Creates a new session.

Requires user activation; accepts monitor for download.
session.prompt()	Instance, Async	
Generates non-streamed output (Batch).

Returns the full string response.
session.promptStreaming()	Instance, Async Iterable	
Generates streaming output.

Returns an async iterable for chunk processing.
session.clone()	Instance	
Creates a duplicate session.

session.terminate()	Instance	
Releases model resources.

  
3.2 Advanced Output Constraint: JSON Schema
A powerful feature of the Prompt API is the ability to enforce structured output using the responseConstraint field within the prompt() or promptStreaming() methods. Developers can pass a standard JSON Schema as the value of this constraint.   

This functionality is paramount for building reliable extension user interfaces and internal logic. By guaranteeing that the LLM output adheres to a strict JSON structure, such as always returning specific fields for data extraction or classification, developers can eliminate complex and often unreliable post-processing steps (like heuristic parsing or regular expressions). The ability to force structured output directly from the model significantly increases the stability and predictability of the generated data.

IV. Summarization API Reference (chrome.ai.summarizer)
The Summarizer API is a specialized interface designed for content reduction, allowing users to distill lengthy content into precise and insightful summaries.   

4.1 Use Cases and Handling Large Inputs
The primary use cases for the Summarizer API include condensing lengthy articles, complex documents, meeting transcripts, or chat conversations into brief, understandable formats. The API is flexible enough to generate various summary formats, such as sentences, paragraphs, or bullet point lists. Specific applications include generating draft titles and headings, creating concise overviews for articles, or providing quick summaries of product reviews.   

For processing exceptionally large documents that might exceed the maximum input context window of Gemini Nano, the Summarizer architecture supports the Summary of Summaries technique. This technique involves segmenting the lengthy input content at natural key points, summarizing each section independently, concatenating the resulting summaries, and then running a final summarization pass on the concatenated text to produce a single, cohesive final result.   

4.2 Initialization and Fine-Grained Configuration
The Summarizer.create() method allows for fine-grained control over the desired output characteristics through a comprehensive options object.   

Configuration Parameters:

Type: Defines the intent of the summary, with allowed values including: key-points (default), tldr (too long; didn't read), teaser, and headline.   

Format: Specifies the output style: markdown (default) or plain-text.   

Length: Controls the relative size of the output: short, medium (default), or long.   

Language Parameters: Supports multilingual operation using BCP 47 language codes. Developers can set the outputLanguage, an array of expectedInputLanguages, and an array of expectedContextLanguages. Specifying these languages enables the browser to reject the request upfront if the specified language combination is unsupported by the underlying model, improving error handling.   

Table 3: Summarizer API create() Configuration Options

Parameter	Type	Description	Allowed Values (Defaults in bold)
type	String	Defines the goal and structure of the summary.	
key-points, tldr, teaser, headline 

format	String	Output formatting style.	
markdown, plain-text 

length	String	Relative length constraint for the output.	
short, medium, long 

outputLanguage	String (BCP 47)	
The expected language for the generated summary.

Single language code (e.g., "es") 

expectedInputLanguages	Array (BCP 47)	
Languages the source text is expected to be in.

Array of language codes (e.g., ["en", "ja"]) 

sharedContext	String	
Optional context to guide the summarization model.

Arbitrary text string 

  
4.3 Output Matrix: Predictable Constraints
The combination of the type and length parameters translates directly into predictable, quantifiable constraints on the output size, allowing developers to design user interfaces that can rely on known maximum output dimensions.   

Table 4: Summarizer API Output Matrix by Type and Length (Maximum Values)

Summary Type	Length Option	Maximum Output Constraint	Format Type
"tldr"	short	1 sentence	
Paragraph 

"tldr"	long	5 sentences	
Paragraph 

"key-points"	medium	5 bullet points	
Bulleted List 

"key-points"	long	7 bullet points	
Bulleted List 

"headline"	short	12 words	
Single sentence 

"headline"	long	22 words	
Single sentence 

  
4.4 Execution Methods: Batch and Streaming
The Summarizer API supports both immediate batch processing and real-time streaming.   

Batch Summarization: The summarize() function processes the entire input text and returns the final summary as a complete string. It accepts the input text and an optional object containing supplemental context to refine the output.   

Streaming Summarization: The summarizeStreaming() function provides results in real-time. It returns an asynchronous iterable, allowing the output to be continuously displayed and updated as the model generates chunks of text.   

V. Translation and Language APIs
The Translator and Language Detector APIs are designed to enable highly efficient, multilingual support within the browser, often using specialized models that operate outside the core Gemini Nano model download sequence for language packs.   

5.1 Translator API (chrome.ai.translator)
The Translator API utilizes an expert model specifically trained to produce high-quality translations. Unlike the general-purpose generative APIs, the Translator API's model is downloaded as a necessary language pack the first time a website or extension requests a translation for a specific language pair.   

The architecture requires developers to specify the source and target languages using BCP 47 language short codes (e.g., 'es' for Spanish). This explicit language pair requirement influences the availability check: the Translator.availability() method must be called with both the source and target language parameters to determine if the specific language pack is ready for use, differentiating it from the base model checks used by the Prompt API.   

Table 5: Translator API Methods

Method	Signature (Inputs)	Functionality
Translator.availability()	{ sourceLanguage: string, targetLanguage: string }	
Checks model readiness for a specific language pair.

Translator.create()	{ sourceLanguage: string, targetLanguage: string, monitor: function }	
Creates a translator instance. Requires user activation.

translator.translate()	text: string	
Performs batch translation.

translator.translateStreaming()	longText: string	
Performs real-time, chunked translation.

  
5.2 Language Detector API (chrome.ai.languageDetector)
The Language Detector API provides a core utility for extensions that operate on user-generated or webpage content, identifying the language used in any given text.   

The primary method, LanguageDetector.detect(), returns a sophisticated, structured output. This output is an array of objects, where each object details a potential language match and a confidence score. Each object contains:   

detectedLanguage: A BCP 47 language tag representing the language detected.   

confidence: A numerical value between 0 and 1 representing the model's certainty.   

For robustness, the result set always includes the BCP 47 tag und (undetermined). This entry represents the probability that the text is not written in any language known to the model, offering a baseline for developers to handle unknown inputs gracefully.   

VI. Writing Assistance APIs
The Writer, Rewriter, and Proofreader APIs are grouped under the Writing Assistance APIs proposal. These specialized generative tools focus on improving, refining, or generating new textual content. They all share the same underlying Gemini Nano architecture and thus are subject to the stringent hardware and storage requirements outlined in Section 2.1.   

6.1 Writer API (chrome.ai.writer)
The Writer API is designed to create new textual content based on a specified task, initial idea, or optional context provided by the user. Its purpose is to support users in composing various types of documents.   

Use Cases: The API can be used to draft new content such as blog posts, user reviews, emails, or to assist users in writing better quality support requests. It is also valuable for drafting professional sections, such as an introduction for a portfolio of work samples. The operation of the Writer API is assumed to mirror the session-based structure of the Prompt API, including methods for checking availability, creating a session (Writer.create()), and executing tasks via batch (write()) or streaming (writeStreaming()) methods.   

6.2 Rewriter API (chrome.ai.rewriter)
The Rewriter API focuses on revising and restructuring existing text, rather than generating content from scratch. It provides functional modifications to textual content, enabling users to refine their drafts quickly and locally.   

Key Functions: This API allows developers to help users adjust text length (making it shorter or longer) or change the emotional or formal tone of the text. Specific applications include transforming a brief draft email into a more polite and formal message, suggesting edits to customer reviews to remove toxicity, or formatting content to align with the expectations of specific target audiences.   

6.3 Proofreader API (chrome.ai.proofreader)
The Proofreader API provides client-side, interactive correction capabilities for grammar, spelling, and punctuation errors. It is built into Chrome to offer quality assurance on composed text within web applications or extensions.   

Advanced Output Structure: A crucial feature for developers is the structured nature of the Proofreader API's output. It goes beyond merely returning corrected text; it provides machine-parseable feedback detailing the necessary changes. This output includes three high-fidelity fields:   

Correction: The suggested correct text.   

Labels: Categorizations of the error type (e.g., grammatical error, punctuation error).   

Explanation: A plain language definition of what the error was or the rationale behind the suggested correction.   

This detailed, structured output is essential for building sophisticated, high-quality user experiences in extensions. Developers can leverage these fields to display suggestions inline, categorize errors for user filtering, and use the explanation field in tooltips or sidebars to educate the user on why the correction was needed, thereby increasing user trust and improving writing skills.   

VII. Future Directions and Responsible Development
7.1 Standards Process and Developer Participation
It is important to note that many of these built-in AI APIs are currently going through a formal standards process. The objective of this process is to establish a unified implementation that ensures web applications and extensions can use the same model, maximizing inference performance and standardization across the web platform.   

Developers are actively encouraged to participate in the Early Preview Program (EPP) and provide comprehensive feedback. Detailed input on specific use cases, comments on API design, and data on the real-world impact of the current implementations are vital for shaping the future evolution and finalization of these exploratory APIs.   

7.2 Ethical Responsibility and the People + AI Guidebook
Given that the built-in AI APIs rely on Gemini Nano, a generative AI model, developers assume an ethical responsibility regarding the output and user experience. It is a fundamental mandate that developers building with these APIs review Google’s People + AI Guidebook (PAIR Guidebook).   

Adherence to the PAIR Guidebook ensures that developers integrate best practices for designing AI features that are transparent, helpful, and responsibly mitigate potential risks, such as bias or inaccuracy, inherent in large language models. This requirement formalizes the need to focus on designing experiences that maintain user trust and promote the constructive application of AI functionality, even when the model operates locally on the user's device.

VIII. Conclusions
The Chrome built-in AI API suite represents a significant advancement in empowering extension developers with low-latency, privacy-preserving AI capabilities via the on-device Gemini Nano model. However, adoption requires careful architectural planning focused on the stringent prerequisites.

The primary conclusion for developers is that the success of Gemini Nano-dependent APIs (Prompt, Summarizer, Writer, Rewriter, Proofreader) hinges entirely on the end-user meeting significant hardware constraints, particularly the 22 GB free storage requirement and the high CPU/GPU minimums. This necessitates building robust availability checks and respecting the user activation mandate during the create() lifecycle to manage resource downloads responsibly.

The specialized nature of the built-in APIs offers distinct advantages: the Summarizer API provides quantifiable and predictable output via its configuration matrix, the Prompt API enables reliable, structured data extraction using JSON Schema constraints, and the Proofreader API delivers high-fidelity feedback (correction, label, explanation) that supports advanced user experience development.

For maximum resilience, developers should consider the Hybrid AI Strategy, using the built-in APIs for speed and privacy while maintaining the Cloud Gemini API as an optional fallback for users whose hardware does not meet Nano’s requirements, or for tasks that demand greater computational scale or multimodal complexity. Continuous engagement with the Origin Trials is necessary to adapt to the ongoing evolution of these experimental interfaces.


developer.chrome.com
Extensions and AI - Chrome for Developers
Opens in a new window

web.dev
Build a local and offline-capable chatbot with the Prompt API - web.dev
Opens in a new window

ai.google.dev
Gemini API reference | Google AI for Developers
Opens in a new window

cloud.google.com
Generate content with the Gemini API in Vertex AI - Google Cloud
Opens in a new window

youtube.com
Practical built-in AI with Gemini Nano in Chrome - YouTube
Opens in a new window

developer.chrome.com
Get started with built-in AI | AI on Chrome
Opens in a new window

developer.chrome.com
Rewriter API | AI on Chrome
Opens in a new window

developer.chrome.com
The Proofreader API | AI on Chrome
Opens in a new window

developer.chrome.com
Summarize with built-in AI | AI on Chrome | Chrome for Developers
Opens in a new window

developer.chrome.com
The Prompt API | AI on Chrome | Chrome for Developers
Opens in a new window

developer.chrome.com
Translation with built-in AI | AI on Chrome | Chrome for Developers
Opens in a new window

developer.chrome.com
Declare permissions | Chrome Extensions
Opens in a new window

developer.chrome.com
Summarization API available for early preview | Blog - Chrome for Developers
Opens in a new window

developer.chrome.com
Join the Proofreader API origin trial | Blog - Chrome for Developers
Opens in a new window

developer.chrome.com
Scale client-side summarization in small context windows | AI on Chrome
Opens in a new window

developer.mozilla.org
LanguageDetector: detect() method - Web APIs - MDN
Opens in a new window

developer.chrome.com
Writer API | AI on Chrome
Opens in a new window
