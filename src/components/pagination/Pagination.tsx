interface Props {
    totalPages: number,
    currentPage: number,
    onPageChange: (no: number) => any | null
}
const AppPagination = ({ totalPages, currentPage, onPageChange }: Props) => {
    return (
        <nav>
            <ul className="flex items-center -space-x-px h-8 text-sm gap-2">
                <li>
                    <span className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 cursor-pointer" onClick={() => onPageChange(currentPage !== 1 ? currentPage - 1 : 1)}>
                        <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4" />
                        </svg>
                    </span>
                </li>
                <li>
                    <span className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border border-gray-300 cursor-pointer`}>{currentPage}</span>
                </li>
                <li>
                    <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 cursor-pointer" onClick={() => onPageChange(currentPage !== totalPages ? currentPage + 1 : currentPage)}>
                        <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                        </svg>
                    </span>
                </li>
            </ul>
        </nav>
    )
}

export default AppPagination