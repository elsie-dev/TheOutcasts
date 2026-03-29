Project Proposal Generator
Purpose
This project uses Claude Code to generate academic project proposals by filling template documents with project-specific content while preserving the exact template structure and formatting.
Workflow
1. Template Analysis
When given a template file (Proposal_Template.docx):

Read and understand the complete template structure
Identify all placeholder sections that need content
Note required diagrams, tables, and formatting
Preserve all headings, numbering, and styles exactly as they appear

2. Content Gathering
Ask the user for:

Project title and description
Problem statement and objectives
Technology stack and tools
Timeline and resources
Any specific requirements

3. Literature Review & Research
For sections requiring external references:

Search for 5+ existing systems/tools relevant to the project domain
Extract key features, weaknesses, and gaps
Find official documentation and APIs
Cite sources in APA 7th edition format

4. Document Generation
Create the proposal by:

Using python-docx to programmatically fill the template
Replacing placeholder text while preserving formatting
Maintaining exact structure (headings, tables, bullet points)
Inserting content in appropriate sections
Leaving fields like "Registration Number" and "Supervisor Name" as [TO BE ADDED] for user completion

5. Quality Checks
Ensure:

All template sections are addressed
No placeholder text remains except fields user must fill
Formatting matches template exactly
Content is concise and academic
References are properly formatted
Tables and diagrams are noted (with placeholders if not generated)

Key Guidelines
Do:

✓ Preserve exact template formatting
✓ Keep content concise and academic
✓ Research real tools/systems for literature review
✓ Follow template structure precisely
✓ Use APA format for references
✓ Mark user-specific fields clearly

Don't:

✗ Change template headings or structure
✗ Add extra sections not in template
✗ Remove placeholder tables/diagrams
✗ Make up fictitious systems or references
✗ Guess user-specific information (names, numbers)