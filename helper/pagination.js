function getPagination(page = 1, totalRows, rowsPerPage = 10) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const offset = (page - 1) * rowsPerPage;
  return { page, totalPages, rowsPerPage, offset };
}

module.exports = { getPagination };
