export default function decorate(block) {
  [...block.children].forEach((row,r) => {
    row.classList.add('richtext-row'+(r+1));
    [...row.children].forEach((column,c) => {
      column.classList.add('richtext-column'+(c+1));
    });
  });
}