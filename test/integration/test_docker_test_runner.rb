#!/usr/bin/env ruby

require_relative '../cyberdojo_test_base'
require_relative 'externals'

class DockerTestRunnerTests < CyberDojoTestBase

  include Externals

  def setup
    super
    ext = externals
    runner = ext[:runner]
    assert_equal "DockerTestRunner", runner.class.name

    #I can wrap runner so runner.run (as called
    #in avatar.test) can be adapted and call
    #adapted runner.inner_run when I need to bypass
    #the inner timeout

    @dojo = Dojo.new(root_path,ext)
  end

  test "DockerTestRunner when outer and inner commands do not timeout" do
    kata = make_kata(@dojo, 'C-assert')
    lion = kata.start_avatar(['lion'])
    visible_files = lion.tags[0].visible_files
    delta = {
      :changed => [ ],
      :unchanged => visible_files.keys,
      :deleted => [ ],
      :new => [ ]
    }
    rags,_,_ = lion.test(delta, visible_files)
    assert_equal :red, rags[-1]['colour']
    assert_equal '', `docker ps -a -q`
  end


end