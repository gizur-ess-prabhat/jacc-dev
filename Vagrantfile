# -*- mode: ruby -*-
# vi: set ft=ruby :

# Multi VM example
#
# See http://docs-v1.vagrantup.com/v1/docs/multivm.html
#
# Vagrant::Config.run do |config|
#   config.vm.define :web do |web_config|
#     web_config.vm.box = "web"
#     web_config.vm.forward_port 80, 8080
#   end
#
#   config.vm.define :db do |db_config|
#     db_config.vm.box = "db"
#     db_config.vm.forward_port 3306, 3306
#   end
# end
#
# vagrant up web
# vagrant ssh




Vagrant.configure("2") do |config|

  #
  # AWS plugin
  #

  config.vm.define :aws do |aws_config|
   # aws_config.vm.forward_port 80, 8080

    aws_config.vm.provider :aws do |aws, override|
      aws.access_key_id     = ENV['AWS_API_KEY']
      aws.secret_access_key = ENV['AWS_API_SECRET']
      aws.keypair_name      = ENV['AWS_KEYPAIR_NAME']
      aws.region            = ENV['AWS_REGION2']

      # For 13.04 use ami-eb95e382
      aws.ami               = "ami-7747d01e"
      #aws.instance_type     =

      override.ssh.username = "ubuntu"
      override.ssh.private_key_path = ENV['AWS_PRIVATE_KEY_PATH']
    end

    aws_config.vm.box = "dummy"
    aws_config.vm.box_url = "https://github.com/mitchellh/vagrant-aws/raw/master/dummy.box"
    aws_config.vm.provision :shell, :path => "bootstrap.sh"

  end


  #
  # A local virtualbox
  #

  config.vm.define :vb do |vb_config|
    vb_config.vm.box = "precise64"
    vb_config.vm.box_url = "http://files.vagrantup.com/precise64.box"
    vb_config.vm.network :forwarded_port, guest: 49150, host: 49150
    vb_config.vm.network :forwarded_port, guest: 49151, host: 49151
    vb_config.vm.network :forwarded_port, guest: 49152, host: 49152
    vb_config.vm.network :forwarded_port, guest: 49153, host: 49153
    vb_config.vm.network :forwarded_port, guest: 49154, host: 49154
    vb_config.vm.network :forwarded_port, guest: 49155, host: 49155
    vb_config.vm.provision :shell, :path => "bootstrap.sh"
  end

end
