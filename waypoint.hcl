project = "pr0music_bot"
app "pr0music_bot" { 
    labels = {   
        "service" = "pr0music_bot",
        "env" = "dev" 
    }
    build {
        use "docker" {} 
    }
    deploy {
        use "docker" {}
    }
}