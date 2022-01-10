project = "pr0music_bot"
app "pr0music_bot" {
  labels = {
    "service" = "pr0music_bot",
    "env"     = "dev"
  }
  build {
    use "docker" {}
    registry {
      use "docker" {
        image = "pr0/pr0music"
        tag   = "latest"
      }
    }
  }
  deploy {
    use "docker" {}
  }
}