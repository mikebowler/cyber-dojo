  test 'chunk with space in its filename' do
  test 'chunk with defaulted now line info' do
  test 'two chunks with leading and trailing same lines ' +
  test 'two chunks first and last lines change ' +
  test 'one chunk with two sections ' +
  test 'one chunk with one section with only lines added' do
      ' aaa',
      ' bbb',
      ' ccc',
      '+ddd',
      '+eee',
      '+fff',
      ' ggg',
      ' hhh',
      ' iii'
              :before_lines => [ 'aaa', 'bbb', 'ccc' ],
                  :added_lines   => [ 'ddd', 'eee', 'fff' ],
                  :after_lines => [ 'ggg', 'hhh', 'iii' ]
      'aaa',
      'bbb',
      'ccc',
      'ddd',
      'eee',
      'fff',
      'ggg',
      'hhh',
      'iii',
      'jjj'
      same_line('aaa', 1),
      same_line('bbb', 2),
      same_line('ccc', 3),
      added_line('ddd', 4),
      added_line('eee', 5),
      added_line('fff', 6),
      same_line('ggg', 7),
      same_line('hhh', 8),
      same_line('iii', 9),
      same_line('jjj', 10)
  test 'one chunk with one section with only lines deleted' do
  test 'one chunk with one section ' +
      ' ddd',
      ' eee',
      ' fff',
      '-ggg',
      '-hhh',
      '-iii',
      '+jjj',
      ' kkk',
      ' lll',
      ' mmm'
              :before_lines => [ 'ddd', 'eee', 'fff' ],
                  :deleted_lines => [ 'ggg', 'hhh', 'iii' ],
                  :added_lines   => [ 'jjj' ],
                  :after_lines => [ 'kkk', 'lll', 'mmm' ]
      'bbb',
      'ccc',
      'ddd',
      'eee',
      'fff',
      'jjj',
      'kkk',
      'lll',
      'mmm',
      'nnn'
      same_line('bbb', 1),
      same_line('ccc', 2),
      same_line('ddd', 3),
      same_line('eee', 4),
      same_line('fff', 5),
      deleted_line('ggg', 6),
      deleted_line('hhh', 7),
      deleted_line('iii', 8),
      added_line('jjj', 6),
      same_line('kkk', 7),
      same_line('lll', 8),
      same_line('mmm', 9),
      same_line('nnn', 10)
  test 'one chunk with one section ' +
  test 'one chunk with one section ' +