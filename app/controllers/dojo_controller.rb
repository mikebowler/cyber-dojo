
class DojoController < ApplicationController

  def index
    @dojo_names = Dojo.names
	if @dojo_names.size == 1
	  redirect_to :controller => 'avatar',
                  :dojo_name => @dojo_names[0]
	end
  end

end
