This script transforms your .svg files into importable React components with customization props such as `className`, `color`, `width`, and `height`. Additionally, any other props can be passed using `...rest`.

The script scans the current directory for .svg files, converts each one into JSX, adds the specified props, and creates a function based on the filename, capitalizing it. These functions are then stored in `icons.jsx` and exported for immediate use.

> To get started, follow these simple steps:

1. **Installation**:
   - Clone this repo wherever you have your svg stored.
     ```bash
     git clone https://github.com/remcostoeten/svg-to-react-component-icon-generator.git
     ```
  To run simply type ```node svg.js``` and et. voila.


### ToDo
- Cli expansion
- Fewer packages
- TypeScript option
- Better svg jsx conversion

not 1.0 yet but it'll do.