# -*- mode: ruby -*-
# vi: set ft=ruby :

#
# Start VM with docker installed
#


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
    aws_config.vm.provision :shell, :path => "bootstrap-ec2.sh"

  end


  #
  # A local virtualbox
  #

  config.vm.define :vb do |vb_config|
    vb_config.vm.box = "precise64"
    vb_config.vm.box_url = "http://files.vagrantup.com/precise64.box"
    vb_config.vm.provision :shell, :path => "bootstrap.sh"
    vb_config.vm.provision :shell, :path => "bootstrap2.sh"
  end

end
