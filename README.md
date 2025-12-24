# DSA Visualizer

Welcome to DSA Visualizer, an open-source project dedicated to building interactive and educational visualizations for Data Structures and Algorithms (DSA). This project helps learners explore, understand, and improve algorithmic concepts through hands-on visual demonstrations.

⸻

📂 Project Structure
```
.
├── index.html
├── LICENSE
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── src
│   ├── App.jsx
│   ├── components
│   │   ├── CompanyLogo.jsx
│   │   ├── dsa                 <-- DSA visualization components
│   │   │   ├── ContributorsSection.jsx
│   │   │   ├── DPVisualizer.jsx
│   │   │   ├── HeapVisualizer.jsx
│   │   │   ├── LinkedListVisualizer.jsx
│   │   │   └── TreeVisualizer.jsx
│   │   ├── layout
│   │   │   ├── Footer.jsx
│   │   │   └── Header.jsx
│   │   └── ScrollToTop.jsx
│   ├── data
│   │   └── contributors.js      <-- contributor data
│   ├── index.css
│   ├── lib                      <-- algorithm and helper libraries
│   │   ├── dsaAdvancedUtils.js
│   │   ├── dsaAlgorithms.js
│   │   └── utils.js
│   ├── main.jsx
│   └── pages
│       └── DsaVisualization.jsx <-- main DSA visualization page
├── tailwind.config.js
├── tools
└── vite.config.js
```
Important: Contributors are only allowed to modify or add files in:
	•	src/components/dsa/
	•	src/data/
	•	src/lib/
	•	src/pages/DsaVisualization.jsx

No additional pages or folders should be created outside these directories.

⸻

🚀 Getting Started

1. Clone the repository
```
git clone <repository-url>
cd <repository-folder>
```
2. Install dependencies

```
npm install
```

3. Run locally
```
npm run dev
```

	•	The application will be available at http://localhost:3000
	•	Open the page to see the DSA visualizations in action.

4. Build for production
```
npm run build
```

	•	The production-ready files will be in the dist/ folder.

⸻

✨ How to Contribute

This project encourages contributions that enhance DSA visualizations. You can contribute by:

	•	Adding new algorithms or visualizations
	•	Improving existing visualizations for clarity and interactivity
	•	Fixing bugs in the existing components - Check the issue tab
	•	Adding new DSA sections (e.g., dynamic programming, trees, heaps)

✅ Contribution Rules
  1.	Allowed directories for contribution:
		```
		•	src/components/dsa/
		•	src/data/
		•	src/lib/
		•	src/pages/DsaVisualization.jsx
  		```
  2.	Do NOT create new pages or folders outside the allowed directories.
  3.	Code Quality
     	```
		•	Use React functional components and hooks
		•	Follow the existing CSS / Tailwind styling for consistency
		•	Keep code modular and reusable
		```
⸻

🌿 Branching Workflow

To ensure a smooth contribution process, follow these rules:

1.	Never commit directly to the main branch.
2.	Create a development branch for your changes:
	```
	git checkout -b dev_<your-name>/<your-feature-name>
	```

	Example: dev_yasir/add-bubble-sort-visualizer

3.	Make your changes in this branch.
4.	Commit your changes with clear commit messages:

	```
	git add .
	git commit -m "Add Bubble Sort visualizer component"
	```

5.	Push your branch to the remote repository:

	```
	git push origin dev_<your-name>/<your-feature-name>
	```

6.	Raise a Pull Request (PR) against the main branch:
   	```
	•	Go to the repository on GitHub
	•	Click “Compare & Pull Request”
	•	Add a descriptive title and summary of your changes
	•	Submit the PR for review
	```

After approval, your changes will be merged into main.

⸻

📝 Reporting Issues

If you encounter any bugs or visual glitches:

	•	Open an issue in the repository
	•	Provide a clear description, steps to reproduce, and screenshots if applicable

⸻

📜 License

This project is licensed under the GPL 3.0 License. See LICENSE￼ for details.

⸻

❤️ Thank You

We appreciate all contributions that help make DSA learning more visual, interactive, and intuitive. Happy coding and visualizing!
